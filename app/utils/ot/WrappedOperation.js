import { xform } from './TextOperation'

// A WrappedOperation contains an operation and corresponing metadata.
class WrappedOperation {
  constructor (operation, meta) {
    this.wrapped = operation
    this.meta = meta
  }

  apply (...args) {
    return this.wrapped.apply(...args)
  }

  invert (...args) {
    let inverseMeta = meta
    if (this.meta && typeof meta.invert === 'function') {
      inverseMeta = meta.invert(...args)
    }
    return new WrappedOperation(this.wrapped.invert(...args), inverseMeta)
  }

  compose (other) {
    const composedOperation = this.wrapped.compose(other.wrapped)
    const composedMeta = typeof this.meta.compose === 'function' ?
      this.meta.compose(other.meta) : ({ ...this.meta, ...other.meta })
    return new WrappedOperation(composedOperation, composedMeta)
  }

  static transform (a, b) {
    const pair = xform(a.wrapped, b.wrapped)
    return [
      new WrappedOperation(pair[0]),
      typeof a.meta.transform === 'function' ? a.meta.transform(b.wrapped) : a.meta,
      new WrappedOperation(pair[1]),
      typeof b.meta.transform === 'function' ? b.meta.transform(a.wrapped) : b.meta,
    ]
  }
}

export default WrappedOperation
