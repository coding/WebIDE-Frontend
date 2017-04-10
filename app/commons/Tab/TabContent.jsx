import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'

export const TabContent = observer(({ tabGroup, children }) => (
  <div className='tab-content'>
    <div className='tab-content-container'>{children}</div>
  </div>
))

TabContent.propTypes = {
  tabGroup: PropTypes.object.isRequired,
}

export const TabContentItem = observer(({ tab, children }) => (
  <div className={cx('tab-content-item', {'active': tab.isActive})}>
    {children}
  </div>
))

TabContentItem.propTypes = {
  tab: PropTypes.object.isRequired,
}

