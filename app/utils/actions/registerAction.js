import _ from 'lodash'
import createAction from './createAction'
import handleAction from './handleAction'

export default function registerAction (...args) {
  let [eventName, actionPayloadCreator, handler] = args
  if (!_.isString(eventName) || !_.isFunction(actionPayloadCreator)) throw Error('registerAction syntax error')

  if (!_.isFunction(handler)) {
    handler = actionPayloadCreator
    actionPayloadCreator = payload => payload
  }

  handleAction(eventName, handler)

  // by default we promisify the actionMsg
  const actionCreator = createAction.promise(eventName, actionPayloadCreator)
  return actionCreator
}
