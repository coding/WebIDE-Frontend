/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import _PaneAxis from './pane'
import TabViewContainer from '../Tab'
import AceEditor from '../AceEditor'

import store from '../../store.js'


var editorPaneConfig = {
  flexDirection: 'row',
  views: [{
    views: [<TabViewContainer defaultContentClass={AceEditor} defaultContentType='editor' />],
    size: 30
  }]
}

var PaneAxis = connect(state => {
  return state.EditorPaneState
})(_PaneAxis)

var PaneContainer = (props) => {
  store.dispatch({
    type: 'PANE_INITIALIZE',
    config: editorPaneConfig
  })
  return <PaneAxis {...props}/>
}

export default PaneContainer
