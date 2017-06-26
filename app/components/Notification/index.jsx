import React from 'react'
import { inject } from 'mobx-react'
import { NotificationStack } from 'react-notification'
import { removeNotification } from './actions'
import state from './state'

const barStyleFactory = (index, style) => {
  return Object.assign({}, style, {
    left: 'initial',
    right: '-100%',
    bottom: 'initial',
    top: `${2 + index * 4}rem`
  })
}

const activeBarStyleFactory = (index, style) => {
  return Object.assign({}, style, {
    left: 'initial',
    right: '1rem',
    bottom: 'initial',
    top: `${2 + index * 4}rem`
  })
}

const Notification = ({ notifications }) => {
  return (
    <NotificationStack
      notifications={notifications}
      onDismiss={notification => removeNotification(notification.key)}
      barStyleFactory={barStyleFactory}
      activeBarStyleFactory={activeBarStyleFactory}
    />
  )
}

export default inject(() => {
  const notifications = state.notifications.toJS()
  return { notifications }
})(Notification)
