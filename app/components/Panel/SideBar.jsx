import React from 'react'
import cx from 'classnames'
import { defaultProps } from 'utils/decorators'
import { observer, inject } from 'mobx-react'
import { activateExtenstion } from '../Package/actions'
import { toggleSidePanelView } from './actions'
import state from './state'

/* shape of label
label = {
  text: String,
  icon: String,
  viewId: String,
}
*/
const SideBarLabel = ({ label, isActive, onClick }) => {
  return (
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
}

const _SideBar = ({ labels=[], side, activeViewId, activateView }) => {
  return (
    <div className={'bar side-bar ' + side}>
      {labels.map((label, idx) =>
        <SideBarLabel key={label.viewId}
          label={label}
          onClick={e => activateView(label.viewId)}
          isActive={activeViewId === label.viewId}
        />
      )}
    </div>
  )
}

const SideBar = inject((__, { side }) => {
  const sidePanelViews = state.sidePanelViews[side]
  const { labels, activeViewId } = sidePanelViews
  return { side, labels, activeViewId, activateView: toggleSidePanelView }
})(_SideBar)

export default SideBar
