/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'

import store from '../../store' // initLifecycle_1: gives the defaultState
import IDE from '../IDE.jsx'
import WorkspaceList from '../../components/Workspace'
import { initState } from './actions'

class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    this.props.dispatch(initState()) // initLifecycle_2
  }
  render () {
    switch (this.props.route) {
      case 'IDE':
        return <IDE />
      case 'WORKSPACES':
        return <WorkspaceList />
      default:
        return <div>Workspace Bootstrap Error!</div>
    }
  }
}

Root = connect(
  state => ({ route: state.WorkspaceState.route })
)(Root)

export default () => {
  return (
    <Provider store={store}>
      <Root id='root-container' />
    </Provider>
  )
}
