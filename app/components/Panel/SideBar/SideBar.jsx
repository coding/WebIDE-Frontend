import React from 'react'
import PropTypes from 'prop-types'
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
  onlyIcon: Boolean
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
        {!label.onlyIcon && <span>{label.text}</span>}
      </div>
    </div>
  </div>
  )

SideBarLabel.propTypes = {
  isActive: PropTypes.bool,
  onClick: PropTypes.func
}

const SideBar = observer(({ side }) => (
  <div className="side-bar-container">
    <PluginArea
      className={`bar side-bar ${side}`}
      position={SIDEBAR[side.toUpperCase()]}
      filter={plugin => !plugin.status.hidden}
      getChildView={plugin => (
        <SideBarLabel
          key={plugin.viewId}
          label={plugin.label}
          onClick={() => toggleSidePanelView(plugin.viewId)}
          isActive={plugin.status.get('active')}
        />
        )}
    />
  </div>))


SideBar.propTypes = {
  // labels: labelsShape,
  side: PropTypes.string,
  activeViewId: PropTypes.string,
  activateView: PropTypes.func
}


export default SideBar
