/* @flow weak */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import cx from 'classnames';
import { dragStart } from '../DragAndDrop/actions';
import * as TabActions from './actions';

const _TabContent = ({tabIds, defaultContentClass}) => {
  let tabContentItems = tabIds.map(tabId =>
    <TabContentItem key={tabId} tabId={tabId} defaultContentClass={defaultContentClass} />
  )
  return (
    <div className='tab-content'>
      <ul className='tab-content-container'>
      {tabContentItems.length
        ? tabContentItems
        : <div className='tab-content-placeholder-monkey'></div>
      }
      </ul>
    </div>
  )
}

_TabContent.propTypes = {
  tabs: PropTypes.array,
}

const TabContent = connect((state, { tabIds }) => ({
  tabs: tabIds.map(tabId => state.TabState.tabs[tabId]),
})
)(_TabContent)


const _TabContentItem = ({ tab, isActive, defaultContentClass }) => {
  return <div className={cx('tab-content-item', {'active': isActive})}>
    {React.createElement(defaultContentClass, { tab })}
  </div>
}

const TabContentItem = connect((state, { tabId }) => {
  const tab = state.TabState.tabs[tabId]
  const isActive = state.TabState.tabGroups[tab.tabGroupId].activeTabId === tabId
  return { tab, isActive }
}
)(_TabContentItem)

export default TabContent
