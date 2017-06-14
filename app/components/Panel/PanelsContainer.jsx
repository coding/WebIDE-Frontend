import React from 'react'
import { connect } from 'react-redux'

import PanelAxis from './PanelAxis'

const PrimaryPanelAxis = connect(state =>
  ({ panel: state.PanelState.panels[state.PanelState.rootPanelId] })
)(PanelAxis)

const PanelsContainer = (props) => {
  return (<PrimaryPanelAxis scope='window' className='primary-panel-axis' />)
}

export default PanelsContainer
