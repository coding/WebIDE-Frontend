import CodingSDK from 'CodingSDK'
import { toJS, observable } from 'mobx'
import { pluginSettingsState, pluginStore } from 'components/Setting/state'
import { pluginConfigEventStore } from 'components/Plugins/store'

class PluginApp {
  constructor (options) {
    this.sdk = new CodingSDK(options) || ''
    this.inializeData = this.sdk.getData() || {}
  }

  get injectComponent () {
    return this.sdk.injectComponent
  }

  get request () {
    return this.sdk.utils.request
  }
  get i18n () {
    const i18n = this.sdk.i18n.i18nComponent
    i18n.get = this.sdk.i18n.getCache
    i18n.language = this.sdk.language
    return i18n
  }
  get sdk () {
    return this._sdk
  }
  set sdk (sdk) {
    this._sdk = sdk
  }
}

export function appRegistry (obj, callback) {
  window.codingPackageJsonp(obj)
  if (callback) {
    callback()
  }
}

export function registerPluginConfiguration (configuration) {
  const { key, properties } = configuration
  pluginSettingsState.set(key, configuration)
  const initialState = Object.keys(properties).reduce((pre, propKey) => {
    pre[propKey] = properties[propKey].default
    return pre
  }, {})
  pluginStore[key] = observable(initialState)
}

export function getPluginConfiguration (pluginKey) {
  return toJS(pluginStore[pluginKey] || observable({}))
}

export function registerPluginConfigChangeHandler (key, fn) {
  if (!pluginConfigEventStore[key]) {
    pluginConfigEventStore[key] = []
  }
  pluginConfigEventStore[key] = [...pluginConfigEventStore[key], fn]
  return () => {
    pluginConfigEventStore[key] = pluginConfigEventStore[key].filter(f => f !== fn)
  }
}

export default PluginApp
