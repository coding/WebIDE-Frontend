import { registerAction } from 'utils/actions'
import state from './state'

export const NOTIFY_TYPE = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning'
}

export const NOTIFICATION_REMOVE = 'NOTIFICATION_REMOVE'
export const removeNotification = registerAction.normal(NOTIFICATION_REMOVE, (notifKey) => {
  const notifToRemove = state.notifications.find(notif => notif.key === notifKey)
  state.notifications.remove(notifToRemove)
})

const NOTIFICATION_ADD = 'NOTIFICATION_ADD'
export const addNotification = registerAction.normal(
  NOTIFICATION_ADD,
  (notification) => {
    const notifKey = Date.now()
    let defaultNotification = {
      message: '',
      action: '',
      notifyType: NOTIFY_TYPE.SUCCESS, // 默认弹出success弹窗
      key: notifKey,
      dismissAfter: 6000,
      onClick: () => removeNotification(notifKey)
    }

    if (notification.notifyType === NOTIFY_TYPE.ERROR) {
      defaultNotification = {
        ...defaultNotification,
        barStyle: { backgroundColor: 'red' },
        actionStyle: { color: 'white' }
      }
    }

    return { ...defaultNotification, ...notification }
  },
  (notification) => {
    state.notifications.push(notification)
  }
)

export const notify = addNotification
