import emitter from '../emitter'

function isValidActionObj (actionObj) {
  if (!actionObj) return false
  if (typeof actionObj !== 'object') return false
  if (typeof actionObj.type !== 'string' || !actionObj.type) return false
  return true
}

function compose (...funcs) {
  if (funcs.length === 0) return arg => arg
  if (funcs.length === 1) return funcs[0]
  return funcs.reduce((a, b) => (...args) => a(b(...args)))
}

function naiveDispatch (actionObj) {
  if (isValidActionObj(actionObj)) {
    if (!actionObj.isDispatched) {
      emitter.emit(actionObj.type, actionObj)
      actionObj.isDispatched = true
    }
  } else if (__DEV__) {
    console.warn('Invalid action object is dispatched', actionObj)
  }
  return actionObj
}

let _dispatch = naiveDispatch
export function dispatch (actionObj) {
  return _dispatch(actionObj)
}

dispatch.middlewares = []

dispatch.applyMiddleware = function (...middlewares) {
  dispatch.middlewares = dispatch.middlewares.concat(middlewares)
  const middlewareAPI = {
    getState: () => dispatch.state,
    dispatch: action => _dispatch(action)
  }
  const chain = middlewares.map(middleware => middleware(middlewareAPI))
  _dispatch = compose(...chain)(_dispatch)
}

export default dispatch
