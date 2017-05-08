import _ from 'lodash'
import { action as mobxAction } from 'mobx'
import emitter from '../emitter'
import createAction from './createAction'

export default function registerAction (...args) {
  let [eventName, actionPayloadCreator, handler] = args
  if (!_.isString(eventName) || !_.isFunction(actionPayloadCreator)) throw Error('registerAction syntax error')

  if (!_.isFunction(handler)) {
    handler = actionPayloadCreator
    actionPayloadCreator = payload => payload
  }

  handler = mobxAction(eventName, handler)
  emitter.on(eventName, actionMsg => {
    // auto resolve/reject promisified actionMsg
    let result
    let resolve = actionMsg.resolve || actionMsg.meta && actionMsg.meta.resolve
    let reject = actionMsg.reject || actionMsg.meta && actionMsg.meta.reject
    try {
      result = handler(actionMsg.payload, actionMsg)
      if (_.isFunction(resolve)) resolve(result)
    } catch (err) {
      if (_.isFunction(reject)) reject(err)
    }
  })

  // by default we promisify the actionMsg
  const actionCreator = createAction.promise(eventName, actionPayloadCreator)

  return actionCreator
}
