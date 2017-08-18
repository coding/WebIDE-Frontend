import { observable, computed } from 'mobx'

/*
 * This decorator enforce a pattern that's widely used in this project,
 *
 *  @protectedObservable _foo = 'bar'
 *
 *  is a short hand for:
 *
 *  @observable _foo = 'bar'
 *  @computed
 *  get foo () { return this._foo }
 *  set foo (value) { return this._foo = value }
 *
 *  you can specify publicKey explicitly by calling:
 *  @protectedObservable('publicFoo') _foo = 'bar'
 */
function _protectedObservableDecorator (target, privateKey, descriptor, publicKey) {
  if (!publicKey) publicKey = privateKey.replace(/^_/, '')

  const computedDescriptor = computed(target, publicKey, {
    get () { return this[privateKey] },
    set (v) { return this[privateKey] = v },
  })

  Object.defineProperty(target, publicKey, computedDescriptor)

  return observable(target, privateKey, descriptor)
}

function protectedObservable (optionalPublicKey) {
  if (typeof optionalPublicKey === 'string') {
    return function protectedObservableDecorator (target, key, descriptor) {
      return _protectedObservableDecorator(target, key, descriptor, optionalPublicKey)
    }
  } else {
    return _protectedObservableDecorator.apply(null, arguments)
  }
}
export default protectedObservable
