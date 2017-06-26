import dispatch from './dispatch'

const actionCreatorFactory = genActionData => function createAction (eventName, actionPayloadCreator = (x => x)) {
  function action (...args) {
    const payload = actionPayloadCreator(...args)
    const actionData = genActionData(eventName, payload)
    dispatch(actionData)
    return actionData
  }
  action.toString = () => eventName
  return action
}

const createAction = actionCreatorFactory(
  (eventName, payload) => ({ type: eventName, payload })
)

createAction.promise = actionCreatorFactory((eventName, payload) => {
  let resolve, reject
  const promise = new Promise((rs, rj) => { resolve = rs; reject = rj })
  const meta = { promise, resolve, reject }

  promise.type = eventName
  promise.payload = payload
  promise.meta = meta
  promise.resolve = resolve
  promise.reject = reject

  return promise
})

export default createAction
