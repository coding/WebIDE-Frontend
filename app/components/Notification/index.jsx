import React, { Component } from 'react'
import { inject } from 'mobx-react'
import { NotificationStack } from 'react-notification'
import * as actions from './actions'
import state from './state'

const actionStyleFactory = (index, style) =>
  Object.assign({}, style, {
    color: '#ccc',
    right: '-100%',
    bottom: 'initial',
    top: `${2 + index * 4}rem`,
    zIndex: 20,
    fontSize: '12px',
    padding: '8px'
  })
const barStyleFactory = (index, style) =>
  Object.assign({}, style, {
    left: 'initial',
    right: '-100%',
    bottom: 'initial',
    top: `${2 + index * 4}rem`,
    zIndex: 20,
    fontSize: '12px',
    padding: '8px'
  })

const activeBarStyleFactory = (index, style) =>
  Object.assign({}, style, {
    left: 'initial',
    right: '1rem',
    bottom: 'initial',
    top: `${2 + index * 4}rem`,
    fontSize: '12px',
    padding: '8px'
  })

function notificationMessageFactory (notifyType, message) {
  let ClassName
  let Color
  switch (notifyType) {
    case 'error':
      ClassName = 'fa fa-times-circle'
      Color = 'red'
      break
    case 'success':
      ClassName = 'fa fa-check-circle'
      Color = 'green'
      break
    case 'warning':
      ClassName = 'fa fa-exclamation-triangle'
      Color = 'orange'
      break
    case 'info':
      ClassName = 'fa fa-info-circle'
      Color = 'blue'
      break
    default:
  }
  return (
    <span style={{ fontSize: 12 }}>
      <span style={{ color: Color }}>
        <i className={ClassName} aria-hidden='true' />
      </span>
      &nbsp;&nbsp;{message}
    </span>
  )
}

class Notification extends Component {
  constructor (props) {
    super()
  }

  render () {
    const notifications = this.props.notifications.map((v) => {
      v.action = <i className='fa fa-close' aria-hidden='true' />
      v.message = notificationMessageFactory(v.notifyType, v.message)
      return v
    })
    return (
      <NotificationStack
        notifications={notifications}
        onDismiss={notification => actions.removeNotification(notification.key)}
        barStyleFactory={barStyleFactory}
        actionStyleFactory={actionStyleFactory}
        activeBarStyleFactory={activeBarStyleFactory}
      />
    )
  }
}

export default inject(() => {
  const notifications = state.notifications.toJS()
  return { notifications }
})(Notification)

export { actions, state }
