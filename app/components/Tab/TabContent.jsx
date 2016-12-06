import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { dragStart } from '../DragAndDrop/actions';
import * as TabActions from './actions';

const _TabContent = ({tabs, defaultContentClass}) => {
  let tabContentItems = tabs.map(tab => {
    return <TabContentItem key={tab.id} tab={tab} defaultContentClass={defaultContentClass} />;
  })
  return (
    <div className='tab-content'>
      <ul className='tab-content-container'>{
        tabContentItems.length || tabContentItems.size
        ? tabContentItems
        : <div className='tab-content-placeholder-monkey'></div>
      }</ul>
    </div>
  )
}

_TabContent.propTypes = {
  tabs: PropTypes.array,
  removeTab: PropTypes.func,
  activateTab: PropTypes.func,
  dragStart: PropTypes.func,
}

const TabContent = connect((state, { tabIds }) => ({
  tabs: tabIds.map(tabId => state.TabState.tabs[tabId]),
}), dispatch => ({
  removeTab: (tabId) => dispatch(TabActions.removeTab(tabId)),
  activateTab: (tabId) => dispatch(TabActions.activateTab(tabId)),
  dragStart: (dragEventObj) => dispatch(dragStart(dragEventObj)),
})
)(_TabContent)


const TabContentItem = ({ tab, defaultContentClass }) => {
  return <div className={cx('tab-content-item', {'active': tab.isActive})}>
    {React.createElement(defaultContentClass, { tab })}
  </div>
}

export default TabContent
