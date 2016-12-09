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

var PanelConfig = {
  flexDirection: 'row',
  views: [
    {
      flexDirection: 'column',
      size: 20,
      views: [<FileTree />]
    }, {
      flexDirection: 'column',
      size: 80,
      views: [{
          flexDirection: 'row',
          size: 75,
          views: [<PanesContainer />]
        }, {
          flexDirection: 'row',
          views: [<TabContainer defaultContentClass={Terminal} defaultContentType='terminal' />],
          size: 25
        }
      ]
    }, {
      flexDirection: 'row',
      size: 20,
      views: ['Right Panel'],
      display: 'none'
    }
  ]
}

const PrimaryPanelAxis = connect(state => {
  return state.PanelState
})(PanelAxis)

const PanelsContainer = (props) => {
  store.dispatch(PanelActions.initializePanels(PanelConfig))
  return (<PrimaryPanelAxis scope='window' className='primary-panel-axis' />);
}

export default PanelsContainer
