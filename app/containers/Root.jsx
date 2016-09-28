/* @flow weak */
import React, { Component } from 'react'
import { Provider } from 'react-redux'
import { connect } from 'react-redux'

import store from '../store'
import IDE from './IDE.jsx'
import WorkspaceList from '../components/Workspace'

class Root extends Component {
  constructor (props) {
    super(props)
  }

  render () {
    const {selectingWorkspace} = this.props
    if (window.isSpaceKeySet) return <IDE />
    if (selectingWorkspace) return <WorkspaceList />
    return <IDE />
  }
}

Root = connect(
  state => state.WorkspaceState
)(Root)

export default (props) => {
  return <Provider store={store}><Root id='root-container' /></Provider>
}
