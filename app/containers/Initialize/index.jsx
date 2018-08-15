import React, { Component } from 'react'
import { loadPlugin } from 'components/Plugins/actions.js'
import { observer } from 'mobx-react'
import config from 'config'
import i18n from 'utils/createI18n'
import state from './state'
import api from '../../backendAPI'
import Login from '../Login'
import Header from '../Header'
import GlobalPrompt from '../GlobalPrompt'
import { Line } from 'rc-progress'
import Tip from './tip';
import Utilities from '../Utilities';
import * as Modal from 'components/Modal/actions';

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
  RequestColl: 'RequestColl',
}

@observer
class Initialize extends Component {
  constructor (props) {
    super(props)
    this.state = {
      prompts: [],
    }
    this.handleBindQcloud = this.handleBindQcloud.bind(this);
    //state.errorCode = 403;
    //state.status = 'Initialize';
  }
  componentWillMount () {
    loadPlugin(require('../../plugin/index.js').default)
    api.getWorkspaceList()
      .then((response) => {
        const { contents } = response
        const firstFlag = localStorage.getItem('firstEnter')
        if (contents.length >= 1 && !firstFlag) {
          localStorage.setItem('firstEnter', true)
        }
      })
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

  handleBindQcloud() {
    Modal.showModal({ type: 'BindQcloud' });
  }

  render () {
    if (state.status === WORKING_STATE.Login) {
      return <Login />
    }
    let hintInfo = null
    let errorInfo = null
    let icon = null
    let info = null
    if (config.isPlatform) {
      icon = <div className='coding-loading'></div>
      if (state.iconState === 'warning') {
        icon = <div className='coding-warning'></div>
      }
    }
    if (state.errorInfo) {
      if (config.isPlatform) {
        icon = <div className='coding-warning'></div>
      }

      errorInfo = (
        <div className='loading-error'>
          <i className='fa fa-exclamation-triangle' />
          {state.errorInfo}
        </div>
      )
    }
    if (state.checkStep === 0) {
      info = (
        <div className='loading-info'>
          {i18n`global.checkingUserinfo`}
        </div>
      )
    } else if (state.checkStep === 1) {
      info = (
        <div className='loading-info'>
          {i18n`global.checkingTencent`}
        </div>
      )
    } else if (state.checkStep === 2) {
      info = (
        <div className='loading-info'>
          {i18n`global.checkingWorkstation`}
        </div>
      )
    } else {
      info = (
        <div className='loading-info'>
          {i18n`global.loadingWorkspace`}
        </div>
      )
    }

    let requestInfo = null
    if (state.errorCode) {
      if (state.errorCode === -1 || state.errorCode === -2) {
        // -1 没有结果 -2 出错
        info = (
          <div className='loading-info warning'>Error</div>
        )
      } else if ((state.errorCode === 404 || state.errorCode === 403) && state.status === 'RequestColl') {
        errorInfo = null
        info = (
          <div className='loading-info'>
            {i18n`global.loadingWorkspaceDenied`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            <button className='btn btn-default' onClick={this.handleRequest} >{i18n`global.requestCollaboration`}</button>
          </div>
        )
      } else if (state.errorCode === 500) {
        errorInfo = null
        if (state.errorInfo.includes('could not create workspace, the workspace number you owned is limited to')) {
          const limit = state.errorInfo.substring(state.errorInfo.length - 1)
          info = (
            <div className='loading-info'>
              {i18n`global.workspaceLimit${{ limit }}`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              <button className='btn btn-primary' onClick={() => window.location.href = '/dashboard'} >{i18n`global.returnDashboard`}</button>
            </div>
          )
        } else if (state.errorInfo.includes('your online workspace is limit to')) {
          const limit = state.errorInfo.substring(state.errorInfo.length - 1)
          info = (
            <div className='loading-info'>
              {i18n`global.workspaceOnlineLimit${{ limit }}`}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              <button className='btn btn-primary' onClick={() => window.location.href = '/dashboard'} >{i18n`global.returnDashboard`}</button>
            </div>
          )
        } else {
          info = (
            <div className='loading-info'>
              {i18n`global.wsNotExist`}
            </div>
          )
        }
      } else if (state.errorCode === 2001) { // 已经过期
        errorInfo = null
        let tencentLink = 'https://console.cloud.tencent.com/lighthosting'
        config.serverInfo.hostStrId = 'lh-1vj4b3ry'
        if (config.serverInfo.hostStrId) {
          const { hostStrId, hostId } = config.serverInfo
          tencentLink = `https://console.cloud.tencent.com/lighthosting/detail/${hostStrId}/overview/${hostId}`
        }
        info = (
          <div className='loading-info'>
            {i18n`global.machineOutofDate`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            <a href={tencentLink} className='btn btn-primary' target='_blank' rel='noopener noreferrer'>{i18n`global.renewals`}</a>
            <div className='link'>
              <a href='https://dnspod.cloud.tencent.com/act/coding' target='_blank' rel='noopener noreferrer' >{i18n`global.actHint`}</a>
            </div>
          </div>
        )
        hintInfo = (
          <div className='hint-info'>
            <Tip />
            {i18n`global.renewalsHint`}
          </div>
        )
      } else if (state.errorCode === 3021 || state.errorCode === 1097 || state.errorCode === 3020) {
        errorInfo = null
        info = (
          <div className='loading-info'>
            {i18n`global.tokenError`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            {/* <button className='btn btn-primary' onClick={() => window.open('https://coding.net/user/account/setting/oauth', '_blank')} >{i18n`global.rebind`}</button> */}
            <button className='btn btn-primary' onClick={() => window.location.href = `https://coding.net/api/oauth/qcloud/rebind?return_url=${window.location.href}`} >{i18n`global.rebind`}</button>
          </div>
        )
      } else if (state.errorCode === 3019) {
        errorInfo = null
        info = (
          <div className='loading-info'>
            {i18n`global.oauthNotFound`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            <button className='btn btn-primary' onClick={this.handleBindQcloud}>{i18n`global.gotoOauth`}</button>
            {/*<button className='btn btn-primary' onClick={() => window.open('https://coding.net/user/account/setting/oauth', '_blank')} >{i18n`global.gotoOauth`}</button>*/}
            {/* <button className='btn btn-primary' onClick={() => window.location.href = `https://coding.net/api/oauth/qcloud/rebind?return_url=${window.location.href}`} >{i18n`global.gotoOauth`}</button> */}
          </div>
        )
      } else if (state.errorCode === 1) {
        errorInfo = null
        info = (
          <div className='loading-info'>
            {i18n`global.oauthOutdate`}
          </div>
        )
        requestInfo = (
          <div className='request-info'>
            <button className='btn btn-primary' onClick={() => window.location.href = `https://coding.net/api/oauth/qcloud/rebind?return_url=${window.location.href}`} >{i18n`global.gotoOauth`}</button>
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
              <button className='btn btn-default' onClick={() => window.location.href = `https://ide.coding.net/ws/?ownerName=codingide&projectName=workstation-demo&isTry=true&open=README.md&envId=ide-tty-php-python-java`} >{i18n`global.tryIDE`}</button>
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
              {/* {i18n`global.loadingWorkspace`} */}
              <div className='loading-progress'>
                <div className='progress-border'></div>
                <Line percent={state.progress} strokeWidth='4' trailWidth='4' strokeColor='#5097E8' trailColor='#323a45' />
              </div>
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              {i18n`global.initMachine`}
            </div>
          )
          hintInfo = (
            <div className='hint-info'>
              <Tip />
              {i18n`global.createHint`}
              <a href='https://console.cloud.tencent.com/lighthosting' target='_blank' rel='noopener noreferrer' >{i18n`global.createCheckHint`}</a>
            </div>
          )
        } else if (state.status === 'TryWorkstationFailed') {
          errorInfo = null
          info = null
          // info = (
          //   <div className='loading-info warning'>Error</div>
          // )
          if (state.errorInfo.startsWith('(50005)')) {
            requestInfo = (
              <div className='request-info'>
                {/* {state.errorInfo} */}
                <div className='title'>{i18n`global.tencentNoRealName`}</div>

                <a href='https://console.cloud.tencent.com/developer' className='btn btn-primary' target='_blank' rel='noopener noreferrer'>{i18n`global.goRealName`}</a>
                <p>&nbsp;</p>
                <p>{i18n`global.tencentNoRealNameHint`}</p>
              </div>
            )
          } else {
            requestInfo = (
              <div className='request-info'>
                {/* {state.errorInfo} */}
                <div className='title'>{state.errorInfo.replace('联系客服', '联系腾讯客服')}</div>
              </div>
            )
          }

          hintInfo = (
            <div className='hint-info'>
              <Tip />
            </div>
          )
        } else if (state.status === 'Rejected') {
          requestInfo = (
            <div className='request-info'>
              {i18n`global.requestCollaborationReject`}
            </div>
          )
          info = (
            <div className='loading-info'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
        } else if (state.status === 'Request') {
          errorInfo = null
          info = (
            <div className='loading-info'>
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
            <div className='loading-info'>
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
              <br />
              {i18n.get('global.checkSSHKey')}
            </div>
          )
          requestInfo = (
            <div className='request-info'>
              <button className='btn btn-default' onClick={this.handleReclone} >{i18n`global.recloneWorkspace`}</button>
            </div>
          )
        } else {
          info = (
            <div className='loading-info'>
              {i18n`global.loadingWorkspaceDenied`}
            </div>
          )
        }
      } else if (state.errorInfo) {
        info = (
          <div className='loading-info'>
            {i18n`global.loadingWorkspaceFailed`}
          </div>
        )
      }
    }

    return (
      <div className='login-page'>
        <GlobalPrompt />
        <div className='initialize-container'>
          {icon}
          {/* <div className='monkey splash-logo'></div> */}
          {info}
          {errorInfo}
          {requestInfo}
        </div>
        {hintInfo}
        <Header handleSignout={e => {
          e.preventDefault()
          api.signout()
        }} />
        <Utilities />
      </div>
    )
  }
}

export default Initialize
