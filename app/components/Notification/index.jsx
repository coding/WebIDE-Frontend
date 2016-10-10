/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { NotificationStack } from 'react-notification'
import * as NotificationActions from './actions'

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

var Notification = ({notifications, removeNotification, addNotification}) => {
  return (
    <NotificationStack
      notifications={notifications}
      onDismiss={notification => removeNotification(notification)}
      barStyleFactory={barStyleFactory}
      activeBarStyleFactory={activeBarStyleFactory}
    />
  )
}

Notification = connect(
  state => state.NotificationState,
  dispatch => bindActionCreators(NotificationActions, dispatch)
)(Notification)

export default Notification
