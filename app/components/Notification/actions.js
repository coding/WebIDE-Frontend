/* @flow weak */
export const NOTIFICATION_ADD = 'NOTIFICATION_ADD'
export function addNotification (payload) {
  return dispatch => {
    var notification, defaultNotification

    defaultNotification = {
      message: '',
      action: 'Dismiss',
      key: Date.now(),
      dismissAfter: 6000,
      onClick: () => dispatch({type: NOTIFICATION_REMOVE, notification})
    }

    let { notifyType } = payload
    if (notifyType === NOTIFY_TYPE.ERROR) {
      defaultNotification = {...defaultNotification, ...{ 
        barStyle: { backgroundColor:'red' },
        actionStyle: { color:'white' }
      }}
    }

    payload = {...defaultNotification, ...payload}

    dispatch({
      type: NOTIFICATION_ADD,
      payload
    })
  }
}

export const notify = addNotification

export const NOTIFY_TYPE = {
  ERROR: 'error',
  INFO: 'info',
}

export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE'
export function removeNotification (payload) {
  return {
    type: NOTIFICATION_REMOVE,
    payload
  }
}
