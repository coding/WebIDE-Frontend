if (typeof Promise !== 'function' && typeof Promise !== 'object') {
  throw "Cannot polyfill Promise when it is " + JSON.stringify(Promise);
}

const protoThen = Promise.prototype.then
const protoCatch = Promise.prototype.catch

const wrappedCatch = function (onRejected) {
  var original = this
  var newPromise = protoCatch.call(this, onRejected)

  if (original._finalCatchHandler) {
    original._isInherited = true
    newPromise.finalCatch(original._finalCatchHandler)
  }

  return newPromise
}

const wrappedThen = function () {
  var original = this
  var newPromise = protoThen.apply(this, arguments)

  if (original._finalCatchHandler) {
    original._isInherited = true
    newPromise.finalCatch(original._finalCatchHandler)
  }

  return newPromise
}

Promise.prototype.finalCatch = function (onRejected) {
  _this = this
  this._finalCatchHandler = function () {
    onRejected.apply(undefined, arguments)
    _this._finalCatchHandler = (f => {})
  }
  protoThen.call(this, res => res, err => {
    if (!this._isInherited) {
      this._finalCatchHandler(err)
    }
  })
  // this.then = wrappedThen
  // this.catch = wrappedCatch
}

Promise.prototype.then = wrappedThen
Promise.prototype.catch = wrappedCatch
