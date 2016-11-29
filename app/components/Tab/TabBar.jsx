import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { dragStart } from '../DragAndDrop/actions';
import * as TabActions from './actions';

const _TabBar = ({ tabIds, tabGroupId, addTab, isDraggedOver }) => {
  return (
    <div className='tab-bar' id={`tab_bar_${tabGroupId}`} data-droppable='TABBAR'>
      <ul className='tab-labels'>
        { tabIds && tabIds.map(tabId =>
          <TabLabel tabId={tabId} key={tabId} />
        ) }
      </ul>
      {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
      <div className='tab-add-btn' onClick={e => addTab(tabGroupId)} >＋</div>
      <div className='tab-show-list'>
        <i className='fa fa-sort-desc' />
      </div>
    </div>
  )
}

_TabBar.propTypes = {
  tabGroupId: PropTypes.string,
  tabIds: PropTypes.object,
  isDraggedOver: PropTypes.bool,
  addTab: PropTypes.func,
}

const TabBar = connect((state, { tabGroupId }) => ({
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabBarTargetId === `tab_bar_${tabGroupId}`
    : false
}), dispatch => ({
  addTab: (tabGroupId) => dispatch(TabActions.createTabInGroup(tabGroupId)),
})
)(_TabBar)


const _TabLabel = ({tab, isDraggedOver, removeTab, activateTab, dragStart}) => {
  const possibleStatus = {
    'modified': '*',
    'warning': '!',
    'offline': '*',
    'sync': '[-]',
    'loading': <i className='fa fa-spinner fa-spin' />
  }

  return (
    <li className={cx('tab-label', {
      active: tab.isActive,
      modified: tab.flags.modified
    })}
      id={`tab_label_${tab.id}`}
      data-droppable='TABLABEL'
      onClick={e => activateTab(tab.id)}
      draggable='true'
      onDragStart={e => dragStart({sourceType: 'TAB', sourceId: tab.id})}
    >
      {isDraggedOver ? <div className='tab-label-insert-pos'></div>: null}
      <div className='title'>{tab.title}</div>
      <div className='control'>
        <i className='close' onClick={e => { e.stopPropagation(); removeTab(tab.id) }}>×</i>
        <i className='dot'></i>
      </div>
    </li>
  )
}

_TabLabel.propTypes = {
  tab: PropTypes.object,
  isDraggedOver: PropTypes.bool,
  removeTab: PropTypes.func,
  activateTab: PropTypes.func,
  dragStart: PropTypes.func,
}

const TabLabel = connect((state, { tabId }) => ({
  isDraggedOver: state.DragAndDrop.meta
    ? state.DragAndDrop.meta.tabLabelTargetId === `tab_label_${tabId}`
    : false,
  tab: state.TabState.tabs.get(tabId),
}), dispatch => ({
  removeTab: (tabId) => dispatch(TabActions.removeTab(tabId)),
  activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
  dragStart: (dragEventObj) => dispatch(dragStart(dragEventObj)),
})
)(_TabLabel)


export default TabBar
