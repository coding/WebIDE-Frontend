import React, { Component } from 'react'
import { loadPlugin } from 'components/Plugins/actions.js'
import Prompt from 'components/Prompt/Prompt'
import { observer } from 'mobx-react'
import config from 'config'
import i18n from 'utils/createI18n'
import browserDetect from 'utils/browserDetect'
import state from './state'
import api from '../../backendAPI'
import Login from '../Login'
import Header from '../Header'
import { Line } from 'rc-progress'

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
  }
  componentWillMount () {
    loadPlugin(require('../../plugin/index.js').default)
  }

  componentDidMount () {
    let id = 0
    const browserVersion = browserDetect()
    const promptMessage = []
    const { prompts } = this.state

    if (!localStorage.getItem('visited')) {
      promptMessage.push({
        content: <p>WebIDE 现已全面升级为 Cloud Studio, 使用旧版 IDE 请点击 <a href='https://ide.coding.net' target='_blank' rel='noopener noreferrer'>WebIDE</a> </p>,
        id: `global-prompt-${id++}`
      })
      localStorage.setItem('visited', true)
    }

    if (browserVersion !== 'Chrome' && browserVersion !== 'Safari') {
      promptMessage.push({
        content: <p>检测到您的浏览器为 {browserVersion}，为保障用户体验，推荐使用 Chrome 或 Safari 浏览器访问。</p>,
        id: `global-prompt-${id++}`
      })
    }

    this.setState({
      prompts: [...prompts, ...promptMessage]
    })
  }

  handleClosePrompt = (id) => {
    const { prompts } = this.state
    this.setState({ prompts: prompts.filter(prompt => prompt.id !== id) })
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
    if (state.userChecked) {
      info = (
        <div className='loading-info'>
          {i18n`global.loadingWorkspace`}
        </div>
      )
    } else {
      info = (
        <div className='loading-info'>
          {i18n`global.checkingUserinfo`}
        </div>
      )
    }
    
    let requestInfo = null
    if (state.errorCode) {
      if (state.errorCode === 403 && state.status === 'RequestColl') {
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
        info = (
          <div className='loading-info'>
            {i18n`global.wsNotExist`}
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
            <button className='btn btn-primary' onClick={() => window.location.href = `https://coding.net/api/oauth/qcloud/rebind?return_url=${window.location.href}`} >{i18n`global.gotoOauth`}</button>
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
              {i18n`global.createHint`}
              <a href='https://console.cloud.tencent.com/lighthosting' target='_blank' rel='noopener noreferrer' >{i18n`global.createCheckHint`}</a>
            </div>
          )
        } else if (state.status === 'TryWorkstationFailed') {
          errorInfo = null
          info = (
            <div className='loading-info warning'>Error</div>
          )
          requestInfo = (
            <div className='request-info'>
              {/* {state.errorInfo} */}
              <div className='title'>{i18n`global.tencentNoRealName`}</div>
              
              <a href='https://console.cloud.tencent.com/developer' className='btn btn-primary' target='_blank' rel='noopener noreferrer'>{i18n`global.goRealName`}</a>
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

    const { prompts } = this.state
    return (
      <div className='login-page'>
        <Prompt prompts={prompts} handleClose={this.handleClosePrompt} />
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
      </div>
    )
  }
}

export default Initialize
