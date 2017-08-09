import emitter from '../emitter'

function isValidActionObj (actionObj) {
  if (!actionObj) return false
  if (typeof actionObj !== 'object') return false
  if (typeof actionObj.type !== 'string' || !actionObj.type) return false
  return true
}

function dispatch (actionObj) {
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

export default dispatch
