import { isArray } from 'lodash'
import { registerAction } from 'utils/actions'
import * as dispatcher from 'commands/dispatchCommand'

export function registerCommand (commandType, handler) {
  registerAction(commandType, (...args) => {
    const [state, payload, actionMsg] = args
    handler(isArray(payload) ? payload[0] : payload)
  })
}

export function executeCommand (commandType, data) {
  dispatcher.default(commandType, data)
}
