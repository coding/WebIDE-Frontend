import dispatch from './dispatch'

const actionCreatorFactory = (genActionData) => {
  return function createAction (eventName, actionPayloadCreator) {
    function action (...args) {
      const payload = actionPayloadCreator(...args)
      const actionData = genActionData(eventName, payload)
      dispatch(actionData)
      return actionData
    }
    action.toString = () => eventName
    return action
  }
}

const createAction = actionCreatorFactory(
  (eventName, payload) => ({ type: eventName, payload })
)

export default createAction

createAction.promise = actionCreatorFactory((eventName, payload) => {
  let resolve, reject
  const promise = new Promise((rs, rj) => { resolve = rs; reject = rj })
  const meta = { promise, resolve, reject }
  const actionData = {
    type: eventName,
    payload,
    meta,
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
  }
  return actionData
})
