import CodingSDK from 'CodingSDK'
import { toJS, observable } from 'mobx'
import { pluginSettingStore } from 'components/Setting/state'
import { pluginConfigEventStore, pluginSettingsItem } from 'components/Plugins/store'
import emitter, { THEME_CHANGED } from 'utils/emitter'
import { createProvider, connectAdvanced } from 'react-redux'

import settings from '../settings'

class PluginContext {
  constructor (options) {
    this.sdk = new CodingSDK(options) || ''
    this.inializeData = this.sdk.getData() || {}
    this.styles = options.styles
    this.prevTheme = settings.appearance.ui_theme.value
    if (this.styles && this.styles[this.prevTheme]) {
      this.styles[this.prevTheme].use()
    }
    emitter.on(THEME_CHANGED, (themeId) => {
      if (themeId !== this.prevTheme) {
        if (this.styles && this.styles[themeId]) {
          if (this.styles[this.prevTheme]) {
            this.styles[this.prevTheme].unuse()
          }
          this.styles[themeId].use()
        }
        this.prevTheme = themeId
      }
    })
  }

  get inject () {
    return this.injectComponent.inject
  }

  get position () {
    return this.injectComponent.position
  }

  get unregister () {
    return this.injectComponent.unregister
  }

  get injectComponent () {
    return this.sdk.injectComponent
  }

  // get request () {
  //   return this.sdk.utils.request
  // }
  get i18n () {
    const i18n = this.sdk.i18n.i18nComponent
    i18n.get = this.sdk.i18n.getCache
    i18n.language = this.sdk.language
    return i18n
  }
  // get sdk () {
  //   return this._sdk
  // }
  // set sdk (sdk) {
  //   this._sdk = sdk
  // }
}

export function appRegistry (obj, callback) {
  window.codingPackageJsonp(obj)
  if (callback) {
    callback()
  }
}

export function registerPluginConfiguration (configuration) {
  const { key, properties, title } = configuration
  pluginSettingsItem.set(key, configuration)
  if (!pluginSettingStore[key]) {
    console.log(`[Plugins-${title}]----Initialize plugin configuration.`)
    const initialState = Object.keys(properties).reduce((pre, propKey) => {
      pre[propKey] = properties[propKey].default
      return pre
    }, {})
    pluginSettingStore[key] = observable(initialState)
  }
}

export function getPluginConfiguration (pluginKey) {
  return toJS(pluginSettingStore[pluginKey] || observable({}))
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

export const createAdvancedProviderAndConnect = (storeKey) => ({
  Provider: createProvider(storeKey),
  connect: (mapStateToProps, mapDispatchToProps) => connectAdvanced(
      (dispatch, options) => (state, props) => {
        const selectedState =
          typeof mapStateToProps === 'function' || !!mapStateToProps
            ? mapStateToProps(state)
            : state
        return {
          ...selectedState,
          ...props,
          ...mapDispatchToProps(dispatch)
        }
      },
      { storeKey }
    )
})

export const IPropertiesType = {
  string: 'string',
  array: 'array',
  boolean: 'boolean'
}

export default PluginContext
