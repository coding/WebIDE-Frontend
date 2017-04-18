import emitter from '../emitter'

export default function handleActions (handlers, state) {
  const eventNames = Object.keys(handlers)
  eventNames.forEach(eventName => {
    const handler = handlers[eventName]
    emitter.on(eventName, actionObj => {
      return handler(state, actionObj.payload, actionObj)
    })
  })
}
