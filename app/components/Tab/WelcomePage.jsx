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
    this.loadRecentWS()
  }

  render () {
    return (
      <div className='welcome-page'>
        <h1>Coding WebIDE</h1>
        <div className='subtitle'>Coding Anytime Anywhere</div>

        <h2>Start</h2>
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
        </div>

        <h2>Help</h2>
        <div className='block help-block'>
          <div className='link-item'>
            <a href='https://coding.net/help/doc/webide/' target='blank'>Document</a>
          </div>
          <div className='link-item'>
            <a href='https://coding.net/feedback' target='blank'>Feedback</a>
          </div>
        </div>
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
          if (ws.defaultWorkspace) {
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

}

export default WelcomePage
