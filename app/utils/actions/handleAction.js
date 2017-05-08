import _ from 'lodash'
import { action as mobxAction } from 'mobx'
import emitter from '../emitter'

export default function handleAction (eventName, handler, state) {
  handler = mobxAction(eventName, handler)
  emitter.on(eventName, actionMsg => {
    // auto resolve/reject promisified actionMsg
    let result
    let resolve = actionMsg.resolve || (actionMsg.meta && actionMsg.meta.resolve)
    let reject = actionMsg.reject || (actionMsg.meta && actionMsg.meta.reject)
    try {
      result = _.isUndefined(state) ? handler(actionMsg.payload, actionMsg)
        : handler(state, actionMsg.payload, actionMsg)
      if (_.isFunction(resolve)) resolve(result)
    } catch (err) {
      if (_.isFunction(reject)) reject(err)
      else throw err
    }
  })
}
