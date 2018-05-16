import React, { Component } from 'react'
import { inject } from 'mobx-react'
import PaneAxis from './PaneAxis'

var PrimaryPaneAxis = inject(state => {
  debugger
  let rootPane = state.PaneState.rootPane
  return { pane: rootPane }
})(PaneAxis)

var PanesContainer = () => {
  return <PrimaryPaneAxis id='primary-pane-axis'/>
}

export default PanesContainer
