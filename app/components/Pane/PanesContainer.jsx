/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PaneAxis from './PaneAxis'
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

var PrimaryPaneAxis = connect(state => {
  return state.Panes
})(PaneAxis)

var PanesContainer = (props) => {
  store.dispatch({
    type: 'PANE_INITIALIZE',
    config: editorPaneConfig
  })
  return <PrimaryPaneAxis {...props}/>
}

export default PanesContainer
