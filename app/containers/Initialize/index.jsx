import React, { Component } from 'react'
import { loadPlugin } from 'components/Plugins/actions.js'
import { observer } from 'mobx-react'
import config from 'config'
import i18n from 'utils/createI18n'
import state from './state'
import api from '../../backendAPI'
import Login from '../Login'
import Header from '../Header'

const WORKING_STATE = {
  Created: 'Created',
  Cloning: 'Cloning',
  Failed: 'Failed',
  Cloned: 'Cloned',
  Invalid: 'Invalid',
  Deleted: 'Deleted',
  Inactive: 'Inactive',
  Maintaining: 'Maintaining',
  Online: 'Online',
  Offline: 'Offline',
  Login: 'Login',
}

@observer
class Initialize extends Component {
  componentWillMount () {
    loadPlugin(require('../../plugin/index.js').default)
  }
  handleRequest = () => {
    api.requestCollaborator()
    state.errorCode = 403
    state.status = 'Request'
  }
  handleReclone = () => {
    api.triggerCloneTask()
    state.status = WORKING_STATE.Created
  }
  render () {
    if (state.status === 'WORKING_STATE.Login') {
      return <Login />
    }
    let hintInfo = null
    let errorInfo = null
    if (state.errorInfo) {
      errorInfo = (
        <div className='loading-error'>
          <i className='fa fa-exclamation-triangle' />
          {state.errorInfo}
        </div>
      )
    }
    let info = (
      <div className='loading-info'>
        {i18n`global.loadingWorkspace`}
      </div>
    )
    let requestInfo = null
    if (state.errorCode) {
      if (state.errorCode === 404) {
        errorInfo = null
        info = (
          <div className='loading-info error'>
            {i18n`global.loadingWorkspaceDenied`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            <button className="btn btn-default" onClick={this.handleRequest} >{i18n`global.requestCollaboration`}</button>
          </div>
        )
      } else if (state.errorCode === 403) {
        if (state.status === 'Nomachine') {
          errorInfo = null
          info = (
            <div className='loading-info'>
              {i18n`global.noMachine`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              <button className='btn btn-primary' onClick={e => state.action({restartApp: this.props.restartApp})} >{i18n`global.tryMachine`}</button>
            </div>
          )
          hintInfo = (
            <div className='hint-info'>
              {i18n`global.tryHint`}
            </div>
          )
        } else if (state.status === 'Initialize') {
          errorInfo = null
          info = (
            <div className='loading-info'>
              {i18n`global.loadingWorkspace`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              {i18n`global.initMachine`}
            </div>
          )
        } else if (state.status === 'Rejected') {
          requestInfo = (
            <div className='request-info'>
              {i18n`global.requestCollaborationReject`}
            </div>
          )
          info = (
            <div className='loading-info error'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
        } else if (state.status === 'Request') {
          errorInfo = null
          info = (
            <div className='loading-info error'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              {i18n`global.requestingCollaboration`}
            </div>
          )
        } else if (state.status === 'Expired') {
          errorInfo = null
          requestInfo = (
            <div className='request-info'>
              {i18n`global.requestCollaborationExpires`}
            </div>
          )
          info = (
            <div className='loading-info error'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
        } else if (state.status === WORKING_STATE.Created || state.status === WORKING_STATE.Cloning) {
          errorInfo = null
          requestInfo = (
            <div className='request-info'>
              {i18n`global.loadingWorkspaceCloning`}
            </div>
          )
          info = (
            <div className='loading-info'>
              {i18n`global.loadingWorkspace`}
            </div>
          )
        } else if (state.status === WORKING_STATE.Failed) {
          errorInfo = null
          info = (
            <div className='loading-info error'>
              {i18n`global.loadingWorkspaceCloneFailed`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              <button className="btn btn-default" onClick={this.handleReclone} >{i18n`global.recloneWorkspace`}</button>
            </div>
          )
        } else {
          info = (
            <div className='loading-info error'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
        }
      } else if (state.errorInfo) {
        info = (
          <div className='loading-info error'>
            {i18n`global.loadingWorkspaceFailed`}
          </div>
        )
      }
    }

    return (
      <div className='login-page'>
        <div className='initialize-container'>
          {config.isPlatform && <div className='coding-loading'></div>}
          {/* <div className='monkey splash-logo'></div> */}
          {info}
          {errorInfo}
          {requestInfo}
        </div>
        {hintInfo}
        <Header />
      </div>
    )
  }
}

export default Initialize
