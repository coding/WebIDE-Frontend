/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PanelView from '../components/Panel'
import store from '../store.js'

const WindowPaneViewContainer = connect(state => {
  return state.WindowPaneState
})(PanelView)

const WindowPaneView = ({config, ...otherProps}) => {
  store.dispatch({
    type: 'PANEL_INITIALIZE',
    scope: 'window',
    config: config
  })

  return (<WindowPaneViewContainer scope='window' {...otherProps} />)
}

export default WindowPaneView
