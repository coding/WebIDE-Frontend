import { observable, extendObservable } from 'mobx'

class Modal {
  // make modal.content observable, to faciliate modal content updating

  constructor (opt) {
    let resolve, reject
    const promise = new Promise((rsv, rjt) => {
      resolve = rsv
      reject = rjt
    })
    const defaults = {
      id: 0,
      isActive: false,
      showBackdrop: false,
      position: 'top',
      content: {},
      meta: { promise, resolve, reject },
    }
    extendObservable(this, defaults, opt)
  }

  update (content) {
    let resolve, reject
    const promise = new Promise((rsv, rjt) => {
      resolve = rsv
      reject = rjt
    })
    this.content = { ...this.content, ...content }
    this.meta = { promise, resolve, reject }
  }
}

const state = observable({
  stack: observable.shallowArray(),
})

export default state
export { Modal }
