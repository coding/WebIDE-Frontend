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
    type: 'CreateEmptyWs',
    name: i18n`project.createEmptyWorkspace`,
    title: i18n`project.createEmptyWorkspace`
  },
  {
    type: 'ImportFromGit',
    name: i18n`project.createFromGitServer`,
    title: i18n`import.importGit`
  },
  {
    type: 'ImportFromCoding',
    name: i18n`project.createFromCoding`,
    title: i18n`import.importCoding`
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

    // empty ws
    type: radioGroup[0].type,
    projectName: '',

    // import from coding
    activeRepo: null,

    // import from git
    url: '',
    showWarn: false
  }

  setActiveRepo = (repo) => {
    this.setState({ activeRepo: repo })
  }

  handleChangeType = (index) => {
    this.setState({ type: index })
  }

  makeProjectCreator = () => {
    const { step, type, projectName, activeRepo, url, showWarn } = this.state
    if (step === 0) return null

    switch (type) {
      case 'CreateEmptyWs':
        return (
          <CreateEmptyWs
            submit={this.handleCreateEmptyWs}
            projectName={projectName}
            onChange={this.handleChangeProjectName}
          />
        )
      case 'ImportFromGit':
        return (
          <ImportFromGit
            url={url}
            showWarn={showWarn}
            onChange={this.handleChangeGitUrl}
            submit={this.submit}
          />
        )
      case 'ImportFromCoding':
        return <ImportFromCoding activeRepo={activeRepo} setActiveRepo={this.setActiveRepo} />
      default:
        return null
    }
  }

  handleChangeProjectName = (data) => {
    this.setState({
      projectName: typeof data === 'object' ? data.target.value : data
    })
  }

  handleCreateEmptyWs = () => {
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
    if (!value) {
      return
    }
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
      storage: 1,
    }).then((res) => {
      if (res.data) {
        window.open(`/ws/${res.data.spaceKey}`, '_self')
      } else {
        notify({ message: `Import failed: ${res.msg}` })
      }
    }).catch((res) => {
      notify({ message: `Import failed: ${res.msg}` })
    })
  }

  submit = () => {
    dismissModal()
    switch (this.state.type) {
      case 'CreateEmptyWs':
        this.handleCreateEmptyWs()
        break
      case 'ImportFromCoding':
        this.handleImportFromCoding()
        break
      case 'ImportFromGit':
        this.handleImportFromGit()
        break
      default:
        break
    }
  }

  submitStatus = () => {
    const { url, projectName, activeRepo, showWarn } = this.state
    switch (this.state.type) {
      case 'CreateEmptyWs':
        return projectName === ''
      case 'ImportFromCoding':
        return !activeRepo
      case 'ImportFromGit':
        return url === '' || showWarn
      default:
        break
    }
    return false
  }

  render () {
    const { step, type } = this.state
    const currentType = radioGroup.find(item => item.type === type)
    return (
      <div className='import-from-coding'>
        <p className='title'>{step === 1 ? currentType.title : i18n`project.createWorkspace`}</p>
        {step === 0 && (
          <div>
            {radioGroup.map(item => (
              <p key={item.type}>
                <input
                  type='radio'
                  id={`ws-${item.type}`}
                  onChange={() => this.handleChangeType(item.type)}
                  checked={type === item.type}
                />
                <label htmlFor={`ws-${item.type}`} style={{ marginLeft: 10 }}>
                  {item.name}
                </label>
              </p>
            ))}
          </div>
        )}
        {this.makeProjectCreator()}
        <hr />
        {step === 0 ? (
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={dismissModal}>{i18n`git.cancel`}</button>
            <button
              className='btn btn-primary'
              onClick={() => this.setState({ step: step + 1 })}
              disabled={type === ''}
            >
              {i18n.get('modal.nextButton')}
            </button>
          </div>
        ) : (
          <div className='modal-ops'>
            <button className='btn btn-default' onClick={() => this.setState({ step: step - 1 })}>
              {i18n.get('modal.prevButton')}
            </button>
            <button
              className='btn btn-primary'
              onClick={this.submit}
              disabled={this.submitStatus()}
            >
              {i18n.get('modal.okButton')}
            </button>
          </div>
        )}
      </div>
    )
  }
}

export default CreateProject
