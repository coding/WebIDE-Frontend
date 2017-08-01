import { CreateI18n } from 'utils/createI18n'
import { request } from './utils'
import store from './store'
import config from './config'
import * as Modal from './components/Modal/actions'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { addComToSideBar } from './components/Panel/SideBar/actions'
import { addComToMenuBar } from './components/MenuBar/actions'
import { addComToContainers } from './containers/actions'
import { closeWebsocketClient, closeTtySocketClient } from '../app/backendAPI/workspaceAPI'
import * as Panel from './components/Panel/actions'
import { app as appExports, lib as libExports } from './exports'

window.app = appExports
window.lib = libExports

export default class {
  // app data
  constructor (config = {}) {
    this.subscribeDataArray = config.subscribeDataArray || []
    this.pkgId = config.pkgId || ''
    this.i18nConfig = config.i18n
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
  get Panel () {
    return Panel
  }
  get modules () {
    return ({
      react: require('react'),
      moment: require('moment'),
      mobx: require('mobx'),
      mobxReact: require('mobx-react'),
    })
  }

  get socketManager () {
    return ({
      closeWebsocketClient,
      closeTtySocketClient
    })
  }

  get injectComponent () {
    return ({
      addComToSideBar,
      addComToMenuBar,
      addComToContainers,
    })
  }
  get i18n () {
    return new CreateI18n(this.i18nConfig || {})
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
