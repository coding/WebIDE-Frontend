/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PaneAxis from './PaneAxis'
import store from '../../store.js'

var PrimaryPaneAxis = connect(state => {
  let rootPane = state.PaneState.panes[state.PaneState.rootPaneId]
  return { pane: rootPane }
})(PaneAxis)

var PanesContainer = (props) => {
  return <PrimaryPaneAxis id='primary-pane-axis' {...props} />
}

export default PanesContainer
