import React, { Component } from 'react'
import api from '../../../backendAPI'
import cx from 'classnames'
import * as Modal from 'components/Modal/actions'
import i18n from 'utils/createI18n'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import config from 'config'
import * as maskActions from 'components/Mask/actions'

class ProjectSelector extends Component {
  constructor (props) {
    super(props)
    this.state = {
      projectId: null,
      projectList: [],
      projectName: null,
      sync: false,
    }
  }
  componentWillMount () {
    api.fetchProjects().then((res) => {
      if (res.length > 0) {
        this.setState({
          projectList: res,
          projectId: res[0].projectId,
          projectName: res[0].name,
        })
      }
    })
  }
  handleCreate () {
    maskActions.showMask({ message: 'Preparing Workspace...' })
    Modal.dismissModal()
    api.findCodingProject({ projectName: this.state.projectName }).then((res) => {
      if (res.data) {
        maskActions.hideMask()
        notify({ message: i18n`import.projectExist`, notifyType: NOTIFY_TYPE.ERROR })
      } else {
        api.createWorkspace({
          cpuLimit: 1,
          memory: 128,
          storage: 1,
          source: 'Coding',
          ownerName: config.globalKey,
          projectName: this.state.projectName
        }).then((res) => {
          if (!res.code) {
            // window.open(`/ws/${res.spaceKey}?open=${options.open}`)
            setTimeout(() => {
              maskActions.hideMask()
              window.location = `/ws/${res.spaceKey}`
            }, 3000)
          } else {
            maskActions.hideMask()
            notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR })
          }
        }).catch((e) => {
          const msg = e.response ? e.response.data.msg : e.message
          notify({ message: msg || `code: ${e.code}`, notifyType: NOTIFY_TYPE.ERROR })
        })
      }
    })
  }
  handleSync = () => {
    if (!this.state.sync) {
      this.setState({
        sync: true
      })
      api.syncProject().then((syncRes) => {
        api.fetchProjects().then((res) => {
          if (res.length > 0) {
            this.setState({
              projectList: res,
              projectId: res[0].projectId,
              projectName: res[0].name,
              sync: false
            })
          } else {
            this.setState({
              sync: false
            })
          }
        })
      })
    }
  }
  renderOptions () {
    const state = this.state
    return state.projectList.map((item, i) => {
      return <div className={cx(
        'template-item', { selected: item.projectId === state.projectId })}
        onClick={e => {
          this.setState({
            projectId: item.projectId,
            projectName: item.name
          })
        }}
        key={item.projectId}
      >
        <i className='fa fa-archive' />
        {item.name}</div>
    })
  }
  render () {
    return (
      <div className='modal-content'>
        <div className="import-plugin-container">
          <div>
            <h1 className="import-header">
              { i18n`import.importCoding` }
              <a href='javascript:void(0)' onClick={this.handleSync} >
                <i className={cx('fa fa-refresh', { 'fa-pulse': this.state.sync })} />
                {i18n`import.sync`}
              </a>
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
              {/* <button className='btn btn-default' disabled={step === 1} onClick={e => this.back()}>上一步</button> */}
              {/* <button className='btn btn-default' disabled={step === maxStep} onClick={e => this.next()}>下一步</button> */}
              <button className='btn btn-primary' disabled={!this.state.projectId} onClick={e => this.handleCreate()}>{i18n`modal.okButton`}</button>
            </div>
          </div>
        </div>

      </div>
    )
  }
}

export default ProjectSelector
