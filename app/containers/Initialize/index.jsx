import React, { Component, PropTypes } from 'react'
import { observer } from 'mobx-react'
import config from 'config'
import { i18n } from 'utils'
import state from './state'
import api from '../../backendAPI'

@observer
class Initialize extends Component {
  render () {
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
        if (state.status === 'Rejected') {
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
      <div className='initialize-container'>
        {config.isPlatform && <div className='coding-loading'></div>}
        {/* <div className='monkey splash-logo'></div> */}
        {info}
        {errorInfo}
        {requestInfo}
      </div>
    )
  }

  handleRequest = () => {
    api.requestCollaborator()
    state.errorCode = 403
    state.status = 'Request'
  }
}

export default Initialize
