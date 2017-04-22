import emitter from '../emitter'
import { action } from 'mobx'

export default function handleActions (handlers, state) {
  const eventNames = Object.keys(handlers)
  eventNames.forEach(eventName => {
    const handler = action(eventName, handlers[eventName])
    emitter.on(eventName, actionObj => {
      return handler(state, actionObj.payload, actionObj)
    })
  })
}
