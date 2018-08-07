import React from 'react'
import PropTypes from 'prop-types'
import cx from 'classnames'
import { observer } from 'mobx-react'

export const TabContent = ({ children }) => (
  <div className='tab-content'>
    <div className='tab-content-container'>{children}</div>
  </div>
)

export const TabContentItem = observer(({ tab, children }) => {
  const ext = tab.title && tab.title.split('.')[1];
  if (tab.isActive && tab.onActive) {
    tab.onActive()
  }
  return (
    <div className={cx('tab-content-item', { active: tab.isActive })} data-ext={ext}>
      {children}
    </div>
  )
})

TabContentItem.propTypes = {
  tab: PropTypes.object.isRequired,
}
