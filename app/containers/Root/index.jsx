/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'

import store from '../../store'
import IDE from '../IDE.jsx'
import WorkspaceList from '../../components/Workspace'
import { initState } from './actions'


class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    this.props.dispatch(initState())
  }
  render () {
    const { selectingWorkspace } = this.props
    if (window.isSpaceKeySet) return <IDE />
    if (selectingWorkspace) return <WorkspaceList />
    return <IDE />
  }
}

Root = connect(
  state => state.WorkspaceState
)(Root)

export default () => {
  return (
    <Provider store={store}>
      <Root id='root-container' />
    </Provider>
  )
}
