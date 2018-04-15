import React, { Component } from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer } from 'mobx-react'
import { dnd } from 'utils'
import { defaultProps } from 'utils/decorators'
import { dispatch } from '../../store'

let TabLabel = observer(({tab, removeTab, activateTab, openContextMenu}) => {
  const tabLabelId = `tab_label_${tab.id}`
  return (
    <li className={cx('tab-label', {
      active: tab.isActive,
      modified: tab.flags.modified
    })}
      id={tabLabelId}
      data-droppable='TABLABEL'
      draggable='true'
      onClick={e => activateTab(tab.id)}
      onDragStart={e => {
        // Chrome 下直接执行 dragStart 会导致立即又出发了 window.dragend, 添加 timeout 以避免无法拖动的情况
        setTimeout(() => dnd.dragStart({ type: 'TAB', id: tab.id }), 0)
      }}
      onContextMenu={e => openContextMenu(e, tab)}
    >
      {dnd.target.id === tabLabelId ? <div className='tab-label-insert-pos'></div>: null}
      {tab.icon ? <div className={`icon ${tab.icon}`}></div>: null}
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => { e.stopPropagation(); removeTab(tab.id) }}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
})

TabLabel.propTypes = {
  tab: PropTypes.object.isRequired,
  removeTab: PropTypes.func.isRequired,
  activateTab: PropTypes.func.isRequired,
  openContextMenu: PropTypes.func.isRequired,
}

TabLabel = defaultProps(props => ({
  activateTab: function () {
    props.tab.activate()
  },
  removeTab: function () {
    props.tab.destroy()
  },
}))(TabLabel)

export default TabLabel
