export default function composeReducers () {
  const reducers = [...arguments]
  if (reducers.length === 0) return arg => arg
  if (reducers.length === 1) return reducers[0]

  var last = reducers[reducers.length - 1]
  var rest = reducers.slice(0, -1)
  return function composedReducers (state, action) {
    return reducers.reduceRight( (lastState, reducer) => {
      return reducer(lastState, action)
    }, state)
  }
}
