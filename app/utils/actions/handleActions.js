import handleAction from './handleAction'

export default function handleActions (handlers, state) {
  const eventNames = Object.keys(handlers)
  eventNames.forEach((eventName) => {
    handleAction(eventName, handlers[eventName], state)
  })
}
