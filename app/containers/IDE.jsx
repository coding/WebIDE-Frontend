/* @flow weak */
import React, { Component } from 'react'
import TopBar from '../components/TopBar'
import StatusBar from '../components/StatusBar'
import { PaneContainer } from '../components/Pane'
import TabViewContainer from '../components/Tab'
import Terminal from '../components/Terminal'
import WindowPaneView from './WindowPaneView'
import FileTree from '../components/FileTree'
import Utilities from './Utilities'

import api from '../api'
import config from '../config'


var windowPaneConfig = {
  flexDirection: 'row',
  views: [
    {
      flexDirection: 'column',
      size: 20,
      views: [<FileTree />]
    }, {
      flexDirection: 'column',
      size: 80,
      views: [{
          flexDirection: 'row',
          size: 75,
          views: [<PaneContainer />]
        }, {
          flexDirection: 'row',
          views: [<TabViewContainer defaultContentClass={Terminal} defaultContentType='terminal' />],
          size: 25
        }
      ]
    }, {
      flexDirection: 'row',
      size: 20,
      views: ['Right Panel'],
      display: 'none'
    }
  ]
}

class IDE extends Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    api.setupWorkspace().then(_config => {
      Object.assign(config, _config)
    })
  }

  render () {
    return (
      <div className='ide-container'>
        <TopBar />
        <WindowPaneView className='main-pane-view' config={windowPaneConfig} />
        <StatusBar />
        <Utilities />
      </div>
    )
  }
}

export default IDE
