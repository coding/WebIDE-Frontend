import state from './state'
import notification from 'components/Notification'

export const NOTIFY_TYPE = {
  ERROR: 'error',
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning'
}

const DEAFAULT_NOTIFY_TYPE = NOTIFY_TYPE.INFO // 默认为info消息类型

export const notify = (config) => {
  if (config.notifyType) {
    notification[config.notifyType]({
      description: config.message
    })
  } else {
    notification[DEAFAULT_NOTIFY_TYPE]({
      description: config.message
    })
  }
}
