import isObject from 'lodash/isObject'
import { registerAction } from 'utils/actions'
import state from './state'

export const STATUS_ADD_MESSAGE = 'status:add_message'
export const addMessage = registerAction(STATUS_ADD_MESSAGE,
  (messageKey, messageText, autoDismiss) => {
    if (isObject(messageKey)) return messageKey
    return { key: messageKey, text: messageText, autoDismiss }
  },
  (message) => {
    const { text, key, autoDismiss } = message
    state.messages.set(key, text)
    const DISMISS_AFTER_MS = 3000
    if (autoDismiss) {
      setTimeout(() => {
        state.messages.delete(key)
      }, DISMISS_AFTER_MS)
    }
  }
)

export const STATUS_REMOVE_MESSAGE = 'status:remove_message'
export const removeMessage = registerAction(STATUS_REMOVE_MESSAGE, (messageKey) => {
  if (!messageKey) messageKey = state.messages.keys().pop()
  state.messages.delete(messageKey)
})
