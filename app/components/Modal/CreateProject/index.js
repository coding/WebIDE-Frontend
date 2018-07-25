import React, { PureComponent } from 'react'

import i18n from 'utils/createI18n'
import config from 'config'
import { createProject, findCodingProject } from 'backendAPI/projectAPI'
import { createWorkspace } from 'backendAPI/workspaceAPI'
import { gitClone } from 'backendAPI/gitAPI'
import { showMask, hideMask } from 'components/Mask/actions'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import { dismissModal } from 'components/Modal/actions'
import CreateEmptyWs from './CreateEmptyWs'
import ImportFromGit from './ImportFromGit'
import ImportFromCoding from './ImportFromCoding'

const radioGroup = [
  {
    title: i18n`project.createWorkspace`,
    items: [
      {
        type: 'CreateEmptyWs',
        name: i18n`project.createEmptyWorkspace`,
        title: i18n`project.createEmptyWorkspace`
      },
      {
        type: 'BindRemote',
        name: i18n`project.bindRemote`,
        title: i18n`project.bindRemote`
      }
    ]
  },
  {
    title: i18n`project.selectRemote`,
    items: [
      {
        type: 'Git',
        name: 'Git',
        title: i18n`import.importGit`
      },
      {
        type: 'Coding',
        name: 'Coding',
        title: i18n`import.importCoding`
      }
    ]
  },
  {
    title: i18n`project.createOrImport`,
    items: [
      {
        type: 'createWorkspace',
        name: i18n.get('project.createBlank'),
        title: i18n`project.createBlank`
      },
      {
        type: 'importCoding',
        name: i18n.get('import.importCoding'),
        title: i18n`import.importCoding`
      }
    ]
  }
]

const initialEmptyProjectOptions = {
  type: 2, // if isProjectPublic then 1 else 2
  gitEnabled: true,
  gitReadmeEnabled: false,
  gitIgnore: 'no',
  gitLicense: 'no',
  vcsType: 'git',
  name: '',
  description: 'A project created by Cloud Studio',
  joinTeam: false,
  teamGK: config.globalKey
}

const initialCodingProjectOptions = {
  cpuLimit: 1,
  memory: 128,
  storage: 1,
  source: 'Coding',
  ownerName: '',
  projectName: ''
}

class CreateProject extends PureComponent {
  state = {
    step: 0,

    types: [radioGroup[0].items[0].type, radioGroup[1].items[0].type, radioGroup[2].items[0].type],
    // ws with git
    projectName: '',

    // empty ws

    emptyName: '',

    // import from coding
    activeRepo: null,

    // import from git
    url: '',
    showWarn: false
  }

  setActiveRepo = (repo) => {
    this.setState({ activeRepo: repo })
  }

  handleChangeTypes = (type) => {
    const { step, types } = this.state
    this.setState({
      types: types.map((t, i) => (i === step ? type : t))
    })
  }

  makeTitle = () => {
    const { step, types } = this.state
    switch (types[step - 1]) {
      case 'CreateEmptyWs':
        return i18n`project.createEmptyWorkspace`
      case 'createWorkspace':
        return i18n`project.createBlank`
      case 'Git':
        return i18n`import.importGit`
      case 'importCoding':
        return i18n`import.importCoding`
      default:
        return radioGroup[step].title
    }
  }

  makeRadioGroup = () => {
    const { step, types } = this.state
    if ((step === 2 && types[1] === 'Git') || (step === 1 && types[0] === 'CreateEmptyWs')) return null
    return radioGroup[step].items.map(item => (
      <p key={item.type}>
        <input
          type='radio'
          id={`ws-${item.type}`}
          onChange={() => this.handleChangeTypes(item.type)}
          checked={types[step] === item.type}
        />
        <label htmlFor={`ws-${item.type}`} style={{ marginLeft: 10, cursor: 'pointer' }}>
          {item.name}
        </label>
      </p>
    ))
  }

  makeProjectCreator = () => {
    const { step, types, projectName, activeRepo, url, showWarn, emptyName } = this.state

    switch (types[step - 1]) {
      case 'CreateEmptyWs':
        return (
          <CreateEmptyWs
            submit={this.submit}
            projectName={emptyName}
            showTitle={false}
            onChange={this.handleChangeEmptyProjectName}
          />
        )
      case 'createWorkspace':
        return (
          <CreateEmptyWs
            submit={this.handleCreateWorkSpace}
            projectName={projectName}
            title={i18n`project.emptyHeader`}
            onChange={this.handleChangeProjectName}
          />
        )
      case 'Git':
        return (
          <ImportFromGit
            url={url}
            showWarn={showWarn}
            onChange={this.handleChangeGitUrl}
            submit={this.submit}
          />
        )
      case 'importCoding':
        return <ImportFromCoding activeRepo={activeRepo} setActiveRepo={this.setActiveRepo} />
      default:
        return null
    }
  }

  makeDefaultBtnText = () => {
    const { step } = this.state
    return step === 0 ? i18n`git.cancel` : i18n`modal.prevButton`
  }

  makePrimaryBtnText = () => {
    const { types, step } = this.state
    return (step === 1 && types[0] === 'CreateEmptyWs')
      || step === 3
      || (step === 2 && types[1] === 'Git')
      ? i18n`modal.okButton`
      : i18n`modal.nextButton`
  }

  handleChangeEmptyProjectName = (data) => {
    this.setState({
      emptyName: typeof data === 'object' ? data.target.value : data
    })
  }

  handleChangeProjectName = (data) => {
    this.setState({
      projectName: typeof data === 'object' ? data.target.value : data
    })
  }

  handleCreateEmptyWs = () => {
    const { emptyName } = this.state
    window.location = `/ws/?projectName=${emptyName}&templateId=5`
  }

  handleCreateWorkSpace = () => {
    const { projectName } = this.state
    const projectOptions = {
      ...initialEmptyProjectOptions,
      name: projectName
    }
    showMask({ message: 'Creating Workspace...' })

    createProject(projectOptions)
      .then((response) => {
        if (response.code === 0) {
          window.location = `/ws/?ownerName=${config.globalKey}&projectName=${projectName}`
        } else {
          hideMask()
          this._notifyWsResponse(response)
        }
      })
      .catch((response) => {
        hideMask()
        this._notifyWsResponse(response)
      })
  }

  _notifyWsResponse = (response) => {
    notify({
      message: !response.msg
        ? `code: ${response.code}`
        : typeof response.msg === 'object'
          ? Object.values(response.msg)[0]
          : response.msg,
      notifyType: NOTIFY_TYPE.ERROR
    })
  }

  handleImportFromCoding = () => {
    const { activeRepo } = this.state
    showMask({ message: i18n`global.preparing` })
    findCodingProject({ projectName: activeRepo.name, ownerName: activeRepo.ownerName })
      .then((res) => {
        if (res.data) {
          hideMask()
          notify({ message: i18n`import.projectExist`, notifyType: NOTIFY_TYPE.INFO })
          return Promise.resolve(false)
        }
        return createWorkspace({
          ...initialCodingProjectOptions,
          ownerName: activeRepo.ownerName,
          projectName: activeRepo.name
        })
      })
      .then((result) => {
        if (!result) return
        if (!result.code) {
          setTimeout(() => {
            hideMask()
            window.location = `/ws/${result.spaceKey}`
          }, 3000)
        } else {
          hideMask()
          const message = result.msg || `code: ${result.code}`
          notify({ message, otifyType: NOTIFY_TYPE.ERROR })
        }
      })
      .catch((e) => {
        hideMask()
        const message = e.response ? e.response.data.msg : e.message
        notify({ message: message || `code: ${e.code}`, notifyType: NOTIFY_TYPE.ERROR })
      })
  }

  handleChangeGitUrl = (e) => {
    const value = e.target.value
    this.setState({
      url: value,
      showWarn: !value.startsWith('git')
    })
  }

  handleImportFromGit = () => {
    const { url } = this.state
    gitClone({
      url,
      cpuLimit: 1,
      memory: 128,
      storage: 1
    })
      .then((res) => {
        if (res.data) {
          window.open(`/ws/${res.data.spaceKey}`, '_self')
        } else {
          notify({ message: `Import failed: ${res.msg}` })
        }
      })
      .catch((res) => {
        notify({ message: `Import failed: ${res.msg}` })
      })
  }

  submit = () => {
    const { step, types } = this.state
    if (this.submitStatus()) return
    dismissModal()

    if (step === 1 && types[0] === 'CreateEmptyWs') {
      this.handleCreateEmptyWs()
    } else {
      switch (types[step - 1]) {
        case 'createWorkspace':
          this.handleCreateWorkSpace()
          break
        case 'importCoding':
          this.handleImportFromCoding()
          break
        case 'Git':
          this.handleImportFromGit()
          break
        default:
          break
      }
    }
  }

  submitStatus = () => {
    const { step, types, url, projectName, activeRepo, showWarn } = this.state
    switch (types[step - 1]) {
      case 'createWorkspace':
        return projectName === ''
      case 'importCoding':
        return !activeRepo
      case 'Git':
        return url === '' || showWarn
      default:
        break
    }
    return false
  }

  render () {
    const { step, types } = this.state
    // const currentType = radioGroup.find(item => item.type === type)
    return (
      <div className='import-from-coding'>
        <p className='title'>{this.makeTitle()}</p>
        {step < 3 && this.makeRadioGroup()}
        {this.makeProjectCreator()}
        <hr />
        <div className='modal-ops'>
          <button
            className='btn btn-default'
            onClick={() => {
              if (step === 0) {
                dismissModal()
              } else {
                this.setState({ step: step - 1 })
              }
            }}
          >
            {this.makeDefaultBtnText()}
          </button>
          <button
            className='btn btn-primary'
            onClick={() => {
              if ((step === 1 && types[0] === 'CreateEmptyWs')
              || step === 3
              || (step === 2 && types[1] === 'Git')
              ) {
                this.submit()
              } else {
                this.setState({ step: step + 1 })
              }
            }}
            disabled={this.submitStatus()}
          >
            {this.makePrimaryBtnText()}
          </button>
        </div>
      </div>
    )
  }
}

export default CreateProject
