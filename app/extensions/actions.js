import notification from 'components/Notification'
import statusBarState from 'components/StatusBar/state'

export function errorNotify (message) {
  notification.error({
    description: message
  })
}

export function infoNotify (message) {
  notification.info({
    description: message
  })
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
