import { handleActions } from 'redux-actions'

const wrapHandler = (handler) => {
  return function (state, action) {
    return handler(state, action.payload, action)
  }
}

export default function newHandleActions (handlers, defaultState) {
  const wrappedHandlers = Object.keys(handlers).reduce(
    (h, key) => {
      h[key] = wrapHandler(handlers[key])
      return h
    }, {})

  return handleActions(wrappedHandlers, defaultState)
}
