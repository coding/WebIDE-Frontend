import React from 'react'
import cx from 'classnames'
import { inject, observer } from 'mobx-react'
import PanelState from './state'
import PanelAxis from './PanelAxis'


const PrimaryPanelAxis = inject(() =>
  ({ panel: PanelState.rootPanel })
)(PanelAxis)

const PanelsContainer = observer(() => {
  return (<PrimaryPanelAxis scope='window' className={cx(
    'primary-panel-axis',
    PanelState.primaryPanelAxis.blur && 'primary-panel-blur')}
  />)
})

export default PanelsContainer
