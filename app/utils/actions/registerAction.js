import _ from 'lodash'
import createAction from './createAction'
import handleAction from './handleAction'

function _registerAction (_createAction, ...args) {
  let [eventName, actionPayloadCreator, handler] = args
  if (!_.isString(eventName) || !_.isFunction(actionPayloadCreator)) throw Error('registerAction syntax error')

  if (!_.isFunction(handler)) {
    handler = actionPayloadCreator
    actionPayloadCreator = payload => payload
  }

  handleAction(eventName, handler)

  // by default we promisify the actionMsg
  const actionCreator = _createAction(eventName, actionPayloadCreator)
  return actionCreator
}

function registerActionPromise (...args) {
  return _registerAction(createAction.promise, ...args)
}

function registerActionNormal (...args) {
  return _registerAction(createAction, ...args)
}

const registerAction = registerActionPromise
registerAction.promise = registerActionPromise
registerAction.normal = registerActionNormal

export default registerAction
