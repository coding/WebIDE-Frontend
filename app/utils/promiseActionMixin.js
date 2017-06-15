const promiseActionMixin = actionCreator => function decoratedActionCreator () {
  const action = actionCreator(...arguments)

  let resolve, reject
  const promise = new Promise((rs, rj) => { resolve = rs; reject = rj })
  const meta = { promise, resolve, reject }

  return {
    ...action,
    meta: action.meta ? { ...action.meta, ...meta } : meta,
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise)
  }
}

export default promiseActionMixin
