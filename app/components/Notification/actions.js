/* @flow weak */
export const NOTIFICATION_ADD = 'NOTIFICATION_ADD'
export function addNotification (_notification) {
  return dispatch => {
    var notification, defaultNotification

    defaultNotification = {
      message: '',
      action: 'Dismiss',
      key: Date.now(),
      dismissAfter: 6000,
      onClick: () => dispatch({type: NOTIFICATION_REMOVE, notification})
    }

    notification = {...defaultNotification, ..._notification}

    dispatch({
      type: NOTIFICATION_ADD,
      notification
    })
  }
}

export const notify = addNotification

export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE'
export function removeNotification (notification) {
  return {
    type: NOTIFICATION_REMOVE,
    notification
  }
}
