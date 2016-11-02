/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  NOTIFICATION_ADD,
  NOTIFICATION_REMOVE
} from './actions'

let _state = {notifications: []}

export default handleActions({
  [NOTIFICATION_ADD]: (state, action) => {
    state = _.cloneDeep(state)
    state.notifications.push(action.payload)
    return state
  },
  [NOTIFICATION_REMOVE]: (state, action) => {
    state = _.cloneDeep(state)
    _.remove(state.notifications, action.payload)
    return state
  },
}, _state)
