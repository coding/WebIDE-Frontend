import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'

const TabLabel = ({tab, isDraggedOver, removeTab, activateTab, dragStart, openContextMenu}) => {
  return (
    <li className={cx('tab-label', {
      active: tab.isActive,
      // modified: tab.flags.modified
    })}
      id={`tab_label_${tab.id}`}
      data-droppable='TABLABEL'
      draggable='true'
      onClick={e => activateTab(tab.id)}
      onDragStart={e => dragStart({sourceType: 'TAB', sourceId: tab.id})}
      onContextMenu={e => openContextMenu(e, tab)}
    >
      {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
      {tab.icon ? <div className={tab.icon}></div>: null}
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => { e.stopPropagation(); removeTab(tab.id) }}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
}

TabLabel.propTypes = {
  tab: PropTypes.object.isRequired,
  isDraggedOver: PropTypes.bool,
  removeTab: PropTypes.func,
  activateTab: PropTypes.func,
  dragStart: PropTypes.func,
  openContextMenu: PropTypes.func.isRequired,
}

export default observer(TabLabel)
