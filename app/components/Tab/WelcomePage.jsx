import _ from 'lodash'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer, inject } from 'mobx-react'
import { observable } from 'mobx'
import dispatchCommand from 'commands/dispatchCommand'
import api from '../../backendAPI'

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
        <h1>欢迎使用 <div className='logo'></div></h1>
        <div className='subtitle'>您将获得前所未有的云端开发体验</div>
        <div className='quick-start'>
          <h2>快速入门</h2>
          <ul>
            <li><a href='https://coding.net/help/doc/webide/online-editing.html' target='_blank' rel='noopener noreferrer'>在线编辑</a></li>
            <li><a href='https://coding.net/help/doc/webide/compile.html' target='_blank' rel='noopener noreferrer'>编译运行</a></li>
            <li><a href='https://coding.net/help/doc/webide/co-operation.html' target='_blank' rel='noopener noreferrer'>协同开发</a></li>
          </ul>
        </div>
        <div className='intro'>
          <p>Cloud Studio 极大的降低了软件开发的门槛。即使您没有软件开发的经验，您也可以立即体验软件开发的魅力，毫无开发环境配置的繁琐。</p>
          <p>使用以下预置的应用程序模版快速开始吧：</p>
          <ul className='demo-links'>
            {/* <li><a href='https://coding.net/help/doc/webide/online-editing.html' target='_blank' rel='noopener noreferrer'>HTML5 应用</a></li> */}
            {/* <li><a href='https://coding.net/help/doc/webide/compile.html' target='_blank' rel='noopener noreferrer'>Python 人工智能</a></li> */}
            <li><a href='javascript: void(0)' onClick={e => {
              this.handleCreateWorkspace({
                ownerName: 'tanhe123',
                projectName: 'WordPress',
                isTry: false,
                open: 'readme.md',
              })
            }} target='_blank' rel='noopener noreferrer'>PHP 博客</a></li>
            <li><a href='javascript: void(0)' onClick={e => {
              this.handleCreateWorkspace({
                ownerName: 'tanhe123',
                projectName: 'JavaDemo',
                isTry: false,
                // envId: 'ide-tty-java-maven',
                open: 'README.md',
              })
            }} target='_blank' rel='noopener noreferrer'>Java 应用</a></li>
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
            <a href='https://coding.net/help/doc/webide/' target='_blank' rel='noopener noreferrer'>帮助文档</a>
            {/* <a href='https://coding.net/help/doc/webide/' target='_blank' rel='noopener noreferrer'>视频教程</a> */}
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
            <a href='https://coding.net/help/doc/webide/' target='_blank' rel='noopener noreferrer'>Document</a>
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
      }
    }
    api.createWorkspace(options).then((res) => {
      // window.location = `/ws/${res.spaceKey}?open=${options.open}`
      window.open(`/ws/${res.spaceKey}?open=${options.open}`)
    })
  }
}

export default WelcomePage
