import { xform } from './TextOperation'

// A WrappedOperation contains an operation and corresponing metadata.
class WrappedOperation {
  constructor (operation, meta) {
    this.wrapped = operation
    this.meta = meta
  }

  apply (str) {
    return this.wrapped.apply(str)
  }

  invert (str) {
    let inverseMeta = this.meta
    if (this.meta && typeof this.meta.invert === 'function') {
      inverseMeta = this.meta.invert(str)
    }
    return new WrappedOperation(this.wrapped.invert(str), inverseMeta)
  }

  compose (other) {
    const composedOperation = this.wrapped.compose(other.wrapped)
    const composedMeta = typeof this.meta.compose === 'function' ?
      this.meta.compose(other.meta) : ({ ...this.meta, ...other.meta })
    return new WrappedOperation(composedOperation, composedMeta)
  }

  static transform (a, b) {
    const transformMeta = (meta, textOperation) =>
      meta && typeof meta.transform === 'function' ? meta.transform(textOperation) : meta
    const pair = xform(a.wrapped, b.wrapped)
    return [
      new WrappedOperation(pair[0], transformMeta(a.meta, b.wrapped)),
      new WrappedOperation(pair[1], transformMeta(b.meta, a.wrapped)),
    ]
  }
}

export default WrappedOperation
