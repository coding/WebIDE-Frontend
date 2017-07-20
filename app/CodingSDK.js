import { request } from './utils'
import store from './store'
import { bindActionCreators } from 'redux'
import config from './config'
import * as Modal from './components/Modal/actions'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { addComToSideBar } from './components/Panel/actions'

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

  get injectComponent () {
    return ({
      addComToSideBar
    })
  }
  get config () {
    return config
  }
  get Modal () {
    return Modal
  }
  get Notify () {
    return ({
      notify,
      NOTIFY_TYPE
    })
  }
}
