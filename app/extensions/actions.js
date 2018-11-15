import { notify } from 'components/Notification/actions'
import statusBarState from 'components/StatusBar/state'

export function notification (params) {
  notify(params)
}

export function errorNotify (message) {
  notify({ notifyType: 'error', message })
}

export function infoNotify (message) {
  notify({ notifyType: 'info', message })
}

export function setStatusBarMessage (text, hideAfterEver) {
  statusBarState.messages.set(text, text)

  function dispose (timeout = 0) {
    setTimeout(() => {
      statusBarState.messages.delete(text)
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
