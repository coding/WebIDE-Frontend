import React, { PropTypes } from 'react'
import cx from 'classnames'
import PluginArea from 'components/Plugins/component'
import { SIDEBAR } from 'components/Plugins/constants'
import { observer } from 'mobx-react'
import { toggleSidePanelView } from './actions'


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
  isActive: PropTypes.bool,
  onClick: PropTypes.func
}

const SideBar = observer(({ side }) => (
  <PluginArea
    className={`bar side-bar ${side}`}
    position={SIDEBAR[side.toUpperCase()]}
    filter={plugin => !plugin.status.hidden}
    getChildView={plugin => (
      <SideBarLabel
        key={plugin.viewId}
        label={plugin.label}
        onClick={() => toggleSidePanelView(plugin.viewId)}
        isActive={plugin.status.active}
      />
      )}
  />))


SideBar.propTypes = {
  // labels: labelsShape,
  side: PropTypes,
  activeViewId: PropTypes.string,
  activateView: PropTypes.func
}


export default SideBar
