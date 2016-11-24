/* @flow weak */
import React, { Component } from 'react'
import { Provider, connect } from 'react-redux'

import store from '../store'
import IDE from './IDE.jsx'
import WorkspaceList from '../components/Workspace'
import ThemeProvider from '../components/ThemeProvider'


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

const defaultLanguage = 'zh_CN'

export default () => {
  return (
    <Provider store={store}>
      <ThemeProvider language={defaultLanguage}>
        <Root id='root-container' />
      </ThemeProvider>
    </Provider>
  )
}
