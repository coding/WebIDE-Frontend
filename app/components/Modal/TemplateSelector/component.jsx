import React, { Component } from 'react'
import remove from 'lodash/remove'
import find from 'lodash/find'
import api from '../../../backendAPI'
import cx from 'classnames'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import config from 'config'
import * as maskActions from 'components/Mask/actions'

class TemplateSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      step: 1,
      templateList: [],
      templateId: null,
      // templateName: null,
      // projectName: null,
      libraryList: [],
      libraryIds: [],
      id: '',
      version: '',
      name: 'NewProject',
      vendor: '',
      environment: 'JavaSE-1.7',
      genActivator: false,
      activator: '',
      makeContributions: false,
    }
  }
  componentWillMount () {
    api.fetchTemplates().then((res) => {
      if (res._embedded.templateEntityList.length > 0) {
        this.setState({
          templateList: res._embedded.templateEntityList,
          templateId: res._embedded.templateEntityList[0].id,
        })
      }
    })

    api.fetchLibraries().then((res) => {
      this.setState({
        libraryList: res._embedded.libraryEntityList
      })
    })
  }
  handleCreate () {
    
    // Modal.dismissModal()
    api.findCodingProject({ projectName: this.state.name }).then((findRes) => {
      if (findRes.data) {
        notify({ message: i18n`import.projectExist`, notifyType: NOTIFY_TYPE.ERROR })
      } else {
        Modal.dismissModal()
        maskActions.showMask({ message: 'Preparing Workspace...' })
        const projectOptions = {
          type: 1, // if isProjectPublic then 1 else 2
          gitEnabled: true,
          gitReadmeEnabled: false,
          gitIgnore: 'no',
          gitLicense: 'no',
          vcsType: 'git',
          name: this.state.name,
          description: 'A project created by IDE',
          joinTeam: false,
          teamGK: config.globalKey,
        }

        api.createProject(projectOptions).then((projectRes) => {
          if (projectRes.code === 0) {
            api.createWorkspace({
              isTry: false,
              cpuLimit: 1,
              memory: 128,
              storage: 1,
              source: 'Coding',
              ownerName: config.globalKey,
              projectName: this.state.name,
              templateId: this.state.templateId,
              libraries: this.state.libraryIds.join(','),
            }).then((res) => {
              maskActions.hideMask()
              if (!res.code) {
                // window.open(`/ws/${res.spaceKey}?open=${options.open}`)
                window.location = `/ws/${res.spaceKey}`

                // else if (res.code === 1103) {
                //   window.location = `/ws/?ownerName=${config.globalKey}&projectName=${this.state.name}`
                // } 
              } else {
                notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR })
              }
            });
          } else if (projectRes.msg) {
            maskActions.hideMask()
            if (typeof projectRes.msg === 'object') {
              notify({ message: Object.values(projectRes.msg)[0], notifyType: NOTIFY_TYPE.ERROR })
            } else {
              notify({ message: projectRes.msg, notifyType: NOTIFY_TYPE.ERROR })
            }
          } else {
            maskActions.hideMask()
            notify({ message: `code: ${projectRes.code}`, notifyType: NOTIFY_TYPE.ERROR })
          }
        }).catch((projectRes) => {
          maskActions.hideMask()
          if (projectRes.msg) {
            if (typeof projectRes.msg === 'object') {
              notify({ message: Object.values(projectRes.msg)[0], notifyType: NOTIFY_TYPE.ERROR })
            } else {
              notify({ message: projectRes.msg, notifyType: NOTIFY_TYPE.ERROR })
            }
          } else {
            notify({ message: `code: ${projectRes.code}`, notifyType: NOTIFY_TYPE.ERROR })
          }
        })


        // api.createWorkspace({
        //   cpuLimit: 1,
        //   memory: 128,
        //   storage: 1,
        //   source: 'Coding',
        //   ownerName: config.globalKey,
        //   projectName: this.state.name,

        // }).then((res) => {
        //   if (!res.code) {
        //     // window.open(`/ws/${res.spaceKey}?open=${options.open}`)
        //     setTimeout(() => {
        //       maskActions.hideMask()
        //       window.location = `/ws/${res.spaceKey}`
        //     }, 3000)
        //   } else {
        //     maskActions.hideMask()
        //     notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR })
        //   }
        // }).catch((e) => {
        //   const msg = e.response ? e.response.data.msg : e.message
        //   notify({ message: msg || `code: ${e.code}`, notifyType: NOTIFY_TYPE.ERROR })
        // })
      }
    })
  }
  renderOptions () {
    const state = this.state
    return state.templateList.map((item, i) => {
      return <div className={cx(
        'template-item', { selected: item.id === state.templateId })}
        onClick={e => {
          this.setState({
            templateId: item.id,
          })
        }}
        key={item.id}
      >
        <i className='fa fa-archive' />
        {item.name}</div>
    })
  }
  randerSDK () {
    const list = this.state.libraryList
    return list.map((item) => {
      return (
        <label className='template-item' key={item.id}>
          <input type='checkbox'
            onChange={e => {
              const { libraryIds } = this.state
              if (find(libraryIds, item.id) > 0) {
                this.setState({
                  libraryIds: remove(libraryIds, (num) => {
                    return num === item.id
                  })
                })
              } else {
                libraryIds.push(item.id)
                this.setState({
                  libraryIds
                })
              }
            }}
            checked={this.state.libraryIds.includes(item.id)}
          />
          {item.name}
        </label>
      )
    })
  }
  render () {
    const { step } = this.state

    let view = null

    if (step === 1) {
      view = (
        <div className='modal-content'>
          <div className="import-plugin-container">
            <div>
              <h1>
                { i18n`import.importTemplate` }
              </h1>
              {/* <hr /> */}
              {/* <p>新建一个插件项目</p> */}
  
              <div className="form-horizontal">
                <div className="form-group">
                  <div className='col-sm-12'>
                    <div className='template-list'>
                      {this.renderOptions()}
                    </div>
                  </div>
                </div>
              </div>
              {/* <hr /> */}
              <div className='modal-ops'>
                <button className='btn btn-default' onClick={e => Modal.dismissModal()}>{i18n`modal.cancelButton`}</button>
                <button className='btn btn-default' disabled={step === 1} onClick={e => this.back()}>上一步</button>
                <button className='btn btn-default' disabled={step === 3} onClick={e => this.next()}>下一步</button>
                <button className='btn btn-primary' disabled onClick={e => this.handleCreate()}>{i18n`modal.okButton`}</button>
              </div>
            </div>
          </div>
  
        </div>
      )
    } else if (step === 2) {
      view = (
        <div className='modal-content'>
          <div className="import-plugin-container">
            <h1>
              选择开发组件
            </h1>
            {/* <hr /> */}
            <div className='form-horizontal'>
              <div className='form-group'>
                <label htmlFor='inputStashName' className='col-sm-10'>
                  <div className='template-list'>
                    {/* {this.randerTemplates()} */}
                    { this.randerSDK() }
                  </div>
                </label>
                <div className='col-sm-2 opt-list'>
                  <button className='btn btn-default' onClick={e => this.selectAll()}>全部选择</button>
                  <button className='btn btn-default' onClick={e => this.unselectAll()}>全部取消</button>
                </div>
              </div>
              {/* <hr /> */}
              <div className='modal-ops'>
                <button className='btn btn-default' onClick={e => Modal.dismissModal()}>{i18n`modal.cancelButton`}</button>
                <button className='btn btn-default' disabled={step === 1} onClick={e => this.back()}>上一步</button>
                <button className='btn btn-default' disabled={step === 3} onClick={e => this.next()}>下一步</button>
                <button className='btn btn-primary' disabled onClick={e => this.handleCreate()}>{i18n`modal.okButton`}</button>
              </div>
            </div>
          </div>
  
        </div>
      )
    } else {
      view = (

      <div className='modal-content'>
        <div className="import-plugin-container">
          <h1>
            插件项目
          </h1>
          <hr />
          <p>请输入项目信息</p>
          <hr />
          <h2>属性:</h2>
          <div className="form-horizontal">
            <div className="form-group">
              <label className="col-sm-2 control-label">ID</label>
              <div className="col-sm-10">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  onChange={e => {
                    this.setState({
                      id: e.target.value
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                  value={this.state.id}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-2 control-label">版本</label>
              <div className="col-sm-10">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  value={this.state.version}
                  onChange={e => {
                    this.setState({
                      version: e.target.value
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-2 control-label">名字</label>
              <div className="col-sm-10">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  value={this.state.name}
                  onChange={e => {
                    this.setState({
                      name: e.target.value
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-2 control-label">提供者</label>
              <div className="col-sm-10">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  value={this.state.vendor}
                  onChange={e => {
                    this.setState({
                      vendor: e.target.value
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-2 control-label">环境</label>
              <div className="col-sm-10 checkbox-inline">
                {this.state.environment}
              </div>
            </div>
            <hr />
            <h2>选项:</h2>
            <div className="form-group">
              <div className="col-sm-12  checkbox-inline">
                <label>
                  <input type='checkbox'
                    onChange={e => {
                      this.setState({
                        genActivator: !this.state.genActivator
                      })
                    }}
                    checked={this.state.genActivator}
                  />
                  生成 Activator, 一个用来控制插件生命周期的 Java 类
                </label>
              </div>
            </div>

            {this.state.genActivator && <div className="form-group">
              <label htmlFor="inputStashName" className="col-sm-2 control-label">Activator</label>
              <div className="col-sm-10">
                <input type="text"
                  className="form-control"
                  id="inputStashName"
                  value={this.state.activator}
                  onChange={e => {
                    this.setState({
                      activator: e.target.value
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                />
              </div>
            </div>}

            <div className="form-group">
              <div className="col-sm-12  checkbox-inline">
                <label>
                  <input type='checkbox'
                    onChange={e => {
                      this.setState({
                        makeContributions: !this.state.makeContributions
                      })
                    }}
                    checked={this.state.makeContributions}
                  />
                  该插件会修改 UI
                </label>
              </div>
            </div>
            <div className='modal-ops'>
              <button className='btn btn-default' onClick={e => Modal.dismissModal()}>{i18n`modal.cancelButton`}</button>
              <button className='btn btn-default' disabled={step === 1} onClick={e => this.back()}>上一步</button>
              <button className='btn btn-default' disabled={step === 3} onClick={e => this.next()}>下一步</button>
              <button className='btn btn-primary' disabled={!this.state.templateId} onClick={e => this.handleCreate()}>{i18n`modal.okButton`}</button>
            </div>
          </div>
        </div>
      </div>
      )
    }

    return view
  }

  back = () => {
    this.setState({
      step: this.state.step - 1
    })
  }

  next = () => {
    this.setState({
      step: this.state.step + 1
    })
  }

  selectAll = () => {
    const libraryList = this.state.libraryList
    const libraryIds = []
    libraryList.forEach((item) => {
      libraryIds.push(item.id)
    })
    this.setState({
      libraryIds
    })
  }

  unselectAll = () => {
    this.setState({
      libraryIds: []
    })
  }
}

export default TemplateSelector
