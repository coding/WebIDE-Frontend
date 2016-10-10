/* @flow weak */
import React, { Component } from 'react'
import TopBar from '../components/TopBar'
import WindowPanels from './WindowPanels'
import StatusBar from '../components/StatusBar'
import Utilities from './Utilities'

import api from '../api'
import config from '../config'


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
        <WindowPanels />
        <StatusBar />
        <Utilities />
      </div>
    )
  }
}

export default IDE
