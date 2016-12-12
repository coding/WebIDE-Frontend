/* @flow weak */
import React, { Component } from 'react'
import TopBar from '../components/TopBar'
import PanelsContainer from '../components/Panel'
import StatusBar from '../components/StatusBar'
import Utilities from './Utilities'

import api from '../api'
import config from '../config'


class IDE extends Component {
  constructor (props) {
    super(props)
    this.state = { isReady: false }
  }

  componentWillMount () {
    api.setupWorkspace().then(_config => {
      Object.assign(config, _config)
      this.setState({ isReady: true })
    })
  }

  render () {
    if (!this.state.isReady) return null
    return (
      <div className='ide-container'>
        <TopBar />
        <PanelsContainer />
        <StatusBar />
        <Utilities />
      </div>
    )
  }
}

export default IDE
