import { notify } from 'components/Notification/actions'
import statusBarState from 'components/StatusBar/state'

export function notification (type, message) {
  notify({ notifyType: type, message })
}

export function errorNotify (message) {
  notify({ notifyType: 'ERROR', message })
}

export function infoNotify (message) {
  notify({ notifyType: 'INFO', message })
}

export function setStatusBarMessage (text, hideAfterEver) {
  statusBarState.messages.push(text)

  function dispose (timeout = 0) {
    setTimeout(() => {
      statusBarState.messages = statusBarState.messages.filter((msg) => msg !== text)
    }, timeout)
  }

  if (typeof hideAfterEver === 'number') {
    dispose(hideAfterEver)
  } else if (typeof hideAfterEver === 'object' && hideAfterEver instanceof Promise) {
    hideAfterEver.then(() => {
      dispose()
    })
  } else {
    dispose(3000)
  }

  return () => dispose()
}
