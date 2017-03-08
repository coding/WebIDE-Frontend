import { request } from './utils'
import store from './store'
import { bindActionCreators } from 'redux'
import config from './config'


export default class {
  // app data
  constructor (config = {}) {
    this.subscribeDataArray = config.subscribeDataArray || []
    this.pkgId = config.pkgId || ''
  }
  getData () {
    const currentStore = store.getState()
    return this.subscribeDataArray.reduce((p, v) => {
      p[v] = currentStore[v] || {}
      return p
    }, {})
  }
  subscribeStore (func) {
    if (!func) return
    store.subscribe(func(this.getData()))
  }
  get utils () {
    return ({
      request,
    })
  }
  get config () {
    return config
  }
  get Modal () {
    return bindActionCreators(Modal, dispatch)
  }
}
