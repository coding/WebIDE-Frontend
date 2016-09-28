/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import PaneView from '../components/Pane'
import store from '../store.js'

const EditorPaneViewContainer = connect(state => {
  return state.EditorPaneState
})(PaneView)

const EditorPaneView = ({config, ...otherProps}) => {
  store.dispatch({
    type: 'PANE_INITIALIZE',
    scope: 'editor',
    config: config
  })

  return (<EditorPaneViewContainer scope='editor' {...otherProps} />)
}

export default EditorPaneView
