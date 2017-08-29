/**
 * @param {function} descriptionHandler - will be passed the description message
 * @param {function} successHandler - will be passed the success message / or the return value of success callback
 * @param {function} errorHandler - will be passed the error message / or the return value of error callback
 * @returns {function} step - step function, see below
 */
function stepFactory ({
  descriptionHandler = (...args) => console.log(...args),
  successHandler = (...args) => console.log(...args),
  errorHandler = (...args) => console.error(...args),
} = {}) {
  /**
   * step function has the syntax of
   * ```
   * step(description, operation)
   * .success(successMsg|successCallback)
   * .error(errorMsg|errorCallback)
   * ```
   *
   * step is best used with `await step(...)`
   * it keeps a internal `allSuccess` state.
   * if any step fails, subsequential steps won't be executed
   *
   * @param {OperationCallback} operation - the operation that you wanna take at this step.
   *
   * The operation callback:
   * @callback OperationCallback
   * @returns {Boolean|Promise}
   * a boolean indicate the success/error state of this operation
   * if it returns a promise, then the promise should resolve to boolean at final step
   * if error is throw from the promise, it's seen as an error state
   */
  function step (description, fn) {
    let successCallback, errorCallback
    if (!step.allSuccess) {
      return ({
        success () { return this },
        error () { return this }
      })
    }
    descriptionHandler(description)
    const promise = Promise.resolve(fn())
    .then((isSuccess) => {
      if (!isSuccess) throw Error('error')
      successCallback && successHandler(successCallback())
    })
    .catch((err) => {
      step.allSuccess = false
      errorCallback && errorHandler(errorCallback())
    })

    promise.success = function (cb) {
      successCallback = typeof cb === 'function' ? cb : (() => cb)
      return this
    }
    promise.error = function (cb) {
      errorCallback = typeof cb === 'function' ? cb : (() => cb)
      return this
    }

    return promise
  }

  step.allSuccess = true
  return step
}

export default stepFactory
