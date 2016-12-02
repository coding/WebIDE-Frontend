export default (state = {
  ExtensionsState: {}
}, action) => {
  const {
    ExtensionState: { localExtensions = {} },
  } = state
  const combinedReducerOption = Object.keys(localExtensions)
  .filter(key => localExtensions[key].reducer)
  .map(key => localExtensions[key].reducer(state, action))
  return Object.assign({}, state, ...combinedReducerOption)
}
