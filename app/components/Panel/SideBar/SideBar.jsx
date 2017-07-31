import React, { PropTypes } from 'react'
import cx from 'classnames'

import { inject, observer } from 'mobx-react'
import { toggleSidePanelView } from './actions'
import state, { labelShape, labelsShape } from './state'

/* shape of label
label = {
  text: String,
  icon: String,
  viewId: String,
}
*/


const SideBarLabel = ({ label, isActive, onClick }) => (
  <div className={
      cx('side-bar-label', {
        active: isActive
      })}
    onClick={onClick}
  >
    <div className='side-bar-label-container'>
      <div className='side-bar-label-content'>
        <i className={cx('icon', label.icon)} />
        <span>{label.text}</span>
      </div>
    </div>
  </div>
  )

SideBarLabel.propTypes = {
  label: labelShape,
  isActive: PropTypes.bool,
  onClick: PropTypes.func
}

const _SideBar = observer(({ labels, side, activeViewId, activateView, hiddenStatus }) => {
  return (
    <div className={`bar side-bar ${side}`}>
      {
      labels
      .filter(label => !hiddenStatus.includes(label.viewId))
      .sort((labelA, labelB) => labelA.weight || 1 > labelB.weight ? -1 : 1)
      .map(label =>
        <SideBarLabel
          key={label.viewId}
          label={label}
          onClick={() => activateView(label.viewId)}
          isActive={activeViewId === label.viewId}
        />
    )}
    </div>)
})

_SideBar.propTypes = {
  labels: labelsShape,
  side: PropTypes,
  activeViewId: PropTypes.string,
  activateView: PropTypes.func
}

const SideBar = inject((__, { side }) => {
  const labels = state.labels.values().filter(label => label.side === side)

  const activeViewId = state.activeStatus.get(side)
  return {
    side,
    labels,
    activeViewId,
    hiddenStatus: state.hiddenStatus,
    activateView: toggleSidePanelView // toggle action
  }
})(_SideBar)

export default SideBar
