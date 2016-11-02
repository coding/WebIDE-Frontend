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

    let { notifyType } = _notification
    if (notifyType === NOTIFY_TYPE.ERROR) {
      defaultNotification = {...defaultNotification, ...{ 
        barStyle: { backgroundColor:'red' },
        actionStyle: { color:'white' }
      }}
    }

    notification = {...defaultNotification, ..._notification}

    dispatch({
      type: NOTIFICATION_ADD,
      notification
    })
  }
}

export const notify = addNotification

export const NOTIFY_TYPE = {
  ERROR: 'error',
  INFO: 'info',
}

export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE'
export function removeNotification (notification) {
  return {
    type: NOTIFICATION_REMOVE,
    notification
  }
}
