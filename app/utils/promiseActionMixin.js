const promiseActionMixin = (actionCreator) => {
  return function decoratedActionCreator () {
    const action = actionCreator.apply(null, arguments)

    let resolve, reject
    let promise = new Promise((rs, rj) => { resolve = rs; reject = rj })
    let meta = { promise, resolve, reject }

    return {
      ...action,
      meta: action.meta ? {...action.meta, ...meta} : meta,
      then: promise.then.bind(promise),
      catch: promise.catch.bind(promise)
    }
  }
}

export default promiseActionMixin
