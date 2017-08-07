import React from 'react'
import { inject } from 'mobx-react'
import PanelState from './state'
import PanelAxis from './PanelAxis'


const PrimaryPanelAxis = inject(() =>
  ({ panel: PanelState.rootPanel })
)(PanelAxis)

const PanelsContainer = () => {
  return (<PrimaryPanelAxis scope='window' className='primary-panel-axis' />)
}

export default PanelsContainer
