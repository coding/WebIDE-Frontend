/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'

import store from '../../store.js'
import PanelAxis from './PanelAxis'
import * as PanelActions from './actions'
import PanesContainer from '../Pane'
import TabContainer from '../Tab'
import Terminal from '../Terminal'
import FileTree from '../FileTree'

const PrimaryPanelAxis = connect(state =>
  ({panel: state.PanelState.panels[state.PanelState.rootPanelId]})
)(PanelAxis)

const PanelsContainer = (props) => {
  return (<PrimaryPanelAxis scope='window' className='primary-panel-axis' />);
}

export default PanelsContainer
