import dispatch from './dispatch'

export default function createAction (eventName, actionCreator) {
  function action () {
    const payload = actionCreator.apply(null, arguments)
    const actionObj = { type: eventName, payload }
    dispatch(actionObj)
    return actionObj
  }
  action.toString = () => eventName
  return action
}
