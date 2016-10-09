/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PaneAxis from './PaneAxis'
import store from '../../store.js'

var PrimaryPaneAxis = connect(state => {
  return state.Panes
})(PaneAxis)

var PanesContainer = (props) => {
  return <PrimaryPaneAxis {...props}/>
}

export default PanesContainer
