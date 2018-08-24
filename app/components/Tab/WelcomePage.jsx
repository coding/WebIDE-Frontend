import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import config from 'config'
import { notify, NOTIFY_TYPE } from '../Notification/actions'
import { observer, inject } from 'mobx-react'
import { observable } from 'mobx'
import dispatchCommand from 'commands/dispatchCommand'
import api from '../../backendAPI'
import * as maskActions from 'components/Mask/actions'
// import { openWindow } from 'utils'
import i18n from 'utils/createI18n'

@observer
class WelcomePage extends Component {
  constructor (props) {
    super(props)
    this.state = observable({
      recentList: []
    })
  }
  componentWillMount () {
    // this.loadRecentWS()
  }

  render () {
    return (
      <div className='welcome-page'>
        <div className='header'>
        </div>
        <h1>欢迎使用 <div className='logo'><span className='beta'>beta</span></div></h1>
        <div className='subtitle'>您将获得前所未有的云端开发体验</div>
        <div className='quick-start'>
          <h2>快速入门</h2>
          <ul>
            <li><a href='https://coding.net/help/doc/cloud-studio/online-editing.html' target='_blank' rel='noopener noreferrer'>在线编辑</a></li>
            <li><a href='https://coding.net/help/doc/cloud-studio/compile.html' target='_blank' rel='noopener noreferrer'>编译运行</a></li>
            <li><a href='https://coding.net/help/doc/cloud-studio/co-operation.html' target='_blank' rel='noopener noreferrer'>协同开发</a></li>
          </ul>
        </div>
        <div className='intro'>
          <p>Cloud Studio 极大的降低了软件开发的门槛。即使您没有软件开发的经验，您也可以立即体验软件开发的魅力，毫无开发环境配置的繁琐。</p>
          <p>使用以下预置的应用程序模版快速开始吧：</p>
          <ul className='demo-links'>
            {/* <li><a href='https://coding.net/help/doc/webide/online-editing.html' target='_blank' rel='noopener noreferrer'>HTML5 应用</a></li> */}
            {/* <li><a href='https://coding.net/help/doc/webide/compile.html' target='_blank' rel='noopener noreferrer'>Python 人工智能</a></li> */}
            {/* <li><a href='/ws/?projectName=WordPress&open=readme.md&templateId=1' target='_blank' rel='noopener noreferrer'>PHP 博客</a></li> */}
            {/* <li><a href='/ws/?projectName=JavaDemo&open=README.md&templateId=4' target='_blank' rel='noopener noreferrer'>Java 应用</a></li> */}
            {/* <li><a href='javascript: void(0)' onClick={e => {
              this.handleCreateWorkspace({
                // ownerName: 'tanhe123',
                projectName: 'WordPress',
                isTry: false,
                open: 'readme.md',
                templateId: 1,
              })
            }} target='_blank' rel='noopener noreferrer'>PHP 博客</a></li>
            <li><a href='javascript: void(0)' onClick={e => {
              this.handleCreateWorkspace({
                // ownerName: 'tanhe123',
                projectName: 'JavaDemo',
                isTry: false,
                // envId: 'ide-tty-java-maven',
                open: 'README.md',
                templateId: 4,
              })
            }} target='_blank' rel='noopener noreferrer'>Java 应用</a></li> */}
            {/* <li><a href='javascript: void(0)' onClick={e => {
              this.handleCreateWorkspace({
                ownerName: 'tanhe123',
                projectName: 'weapp-template',
                isTry: false,
                // envId: 'ide-tty-nodejs',
                open: 'README.md',
              })
            }} target='_blank' rel='noopener noreferrer'>小程序</a></li> */}
          </ul>

          <div className='btn-list'>
            <a href='https://coding.net/help/doc/cloud-studio' target='_blank' rel='noopener noreferrer'>帮助文档</a>
            <a href='https://coding.net/help/doc/cloud-studio/video.html' target='_blank' rel='noopener noreferrer'>视频教程</a>
          </div>
          
          <div className='coding-logo'></div>
        </div>
        {/* <h2>Start</h2>
        <div className='block start-block'>
          <div className='link-item'>
            <a href='#' onClick={this.createNewFile}>New File...</a>
          </div>
          <div className='link-item'>
            <a href='#' onClick={this.createNewFolder}>New Folder...</a>
          </div>
        </div>

        <h2>Recent</h2>
        <div className='block recent-block'>
          {this.renderRecentItem()}
        </div> */}

        {/* <h2>Help</h2>
        <div className='block help-block'>
          <div className='link-item'>
            <a href='https://coding.net/help/doc/cloud-studio' target='_blank' rel='noopener noreferrer'>Document</a>
          </div>
          <div className='link-item'>
            <a href='https://coding.net/feedback' target='_blank' rel='noopener noreferrer'>Feedback</a>
          </div>
        </div> */}
      </div>
    )
  }
  renderRecentItem () {
    return (
      <div className='recent-list'>
        {
          this.state.recentList.map((recentItem) => {
            return (
              <div className='recent-item' key={recentItem.name}>
                <a href={recentItem.link}>{recentItem.name}</a>
              </div>
            )
          })
        }
      </div>
    )
  }
  createNewFile (e) {
    e.preventDefault()
    dispatchCommand('file:new_file')
  }
  createNewFolder (e) {
    e.preventDefault()
    dispatchCommand('file:new_folder')
  }
  loadRecentWS () {
    api.getWorkspaceList().then((res) => {
      if (res.contents && res.contents.length > 0) {
        const recentList = []
        res.contents.forEach((ws) => {
          let name = ''
          if (ws.defaultWorkspace || !ws.project) {
            name = 'Default'
          } else {
            name = `${ws.project.ownerName}/${ws.project.name}`
          }
          const wsItem = {
            name,
            icon: '',
            link: `/ws/${ws.spaceKey}`,
            command: () => {
              window.open(`/ws/${ws.spaceKey}`)
            },
          }
          recentList.push(wsItem)
        })

        this.state.recentList = recentList
      }
    })
  }
  handleCreateWorkspace (options) {
    options = {
      ...options,
      ...{
        cpuLimit: 1,
        memory: 128,
        storage: 1,
        ownerName: config.globalKey
      }
    }

    const projectOptions = {
      type: 2, // if isProjectPublic then 1 else 2
      gitEnabled: true,
      gitReadmeEnabled: false,
      gitIgnore: 'no',
      gitLicense: 'no',
      vcsType: 'git',
      name: options.projectName,
      description: 'A demo project',
      joinTeam: false,
      teamGK: config.globalKey,
    }
    maskActions.showMask({ message: i18n`global.preparing` })
    api.createProject(projectOptions).then((projectRes) => {
      if (projectRes.code === 0) {
        api.createWorkspace(options).then((res) => {
          if (!res.code) {
            // window.open(`/ws/${res.spaceKey}?open=${options.open}`)
            setTimeout(() => {
              maskActions.hideMask()
              window.location = `/ws/${res.spaceKey}?open=${options.open}`
              // openWindow(`/ws/${res.spaceKey}?open=${options.open}`)
            }, 3000)
          } else {
            maskActions.hideMask()
            notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR })
          }
        })
      } else if (projectRes.code === 1103) {
        // 如果存在 project
        // 如果 ws 存在并不是 invalide
        api.findSpaceKey({ ownerName: config.globalKey, projectName: options.projectName }).then((spaceKey) => {
          if (spaceKey) {
            // config.spaceKey = spaceKey
            if (spaceKey !== config.spaceKey) {
              const redirectUrl = `${window.location.origin}/ws/${spaceKey}`
              // if (window.history.pushState) {
                // window.history.pushState(null, null, redirectUrl)
              // } else {
                // window.location = redirectUrl
              // }
              // openWindow(redirectUrl)
              window.location = redirectUrl
            }
            maskActions.hideMask()
          } else {
            api.createWorkspace(options).then((res) => {
              if (!res.code) {
                // window.open(`/ws/${res.spaceKey}?open=${options.open}`)
                setTimeout(() => {
                  maskActions.hideMask()
                  window.location = `/ws/${res.spaceKey}?open=${options.open}`
                  // openWindow(`/ws/${res.spaceKey}?open=${options.open}`)
                }, 3000)
              } else {
                maskActions.hideMask()
                notify({ message: res.msg || `code: ${res.code}`, notifyType: NOTIFY_TYPE.ERROR })
              }
            })
          }
        })
        // api.getWorkspace()
        // maskActions.hideMask()
        // window.location = `/ws/?ownerName=${config.globalKey}&projectName=${options.projectName}`
      } else if (projectRes.msg) {
        maskActions.hideMask()
        if (typeof projectRes.msg === 'object') {
          notify({ message: Object.values(projectRes.msg)[0], notifyType: NOTIFY_TYPE.ERROR })
        } else {
          notify({ message: projectRes.msg, notifyType: NOTIFY_TYPE.ERROR })
        }
      } else {
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
  }
}

export default WelcomePage
