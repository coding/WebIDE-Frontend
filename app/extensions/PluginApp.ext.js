import CodingSDK from 'CodingSDK'

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

export default PluginApp
