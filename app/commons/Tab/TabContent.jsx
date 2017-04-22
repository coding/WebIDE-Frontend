import React, { PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'

export const TabContent = ({ children }) => (
  <div className='tab-content'>
    <div className='tab-content-container'>{children}</div>
  </div>
)

export const TabContentItem = observer(({ tab, children }) => (
  <div className={cx('tab-content-item', { active: tab.isActive })}>
    {children}
  </div>
))

TabContentItem.propTypes = {
  tab: PropTypes.object.isRequired,
}

