/* @flow weak */
import _ from 'lodash'
import {
  NOTIFICATION_ADD,
  NOTIFICATION_REMOVE
} from './actions'

export default function NotificationReducer (state = {notifications: []}, action) {
  var _state = state
  state = _.cloneDeep(state)

  switch (action.type) {
    case NOTIFICATION_ADD:
      state.notifications.push(action.payload)
      return state

    case NOTIFICATION_REMOVE:
      _.remove(state.notifications, action.payload)
      return state

    default:
      return _state
  }
}
