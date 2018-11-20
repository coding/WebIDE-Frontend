import { errorNotify } from '../extensions/actions'

export const PluginRegistry = {
  _plugins: {},
  get packages () {
    return this._plugins
  },
  delete (key) {
    delete this._plugins[key]
  },
  get (key) {
    return this._plugins[key]
  },
  set (key, plugin) {
    if (this._plugins[key]) {
      console.error(`PluginKey ${key} repeated, plugin will be replaced.`)
      errorNotify(`PluginKey ${key} repeated, plugin will be replaced.`)
    }
    this._plugins[key] = plugin
  },
  find (pkgId) {
    return Object.values(this._plugins).find(value => value.pkgId === pkgId)
  },
  findAll (pkgId) {
    return Object.values(this._plugins).filter(value => value.pkgId === pkgId)
  },
  findAllByType (loadType) {
    return Object.values(this._plugins).filter(value => value.loadType === loadType)
  }
}
// for test
window.PluginRegistry = PluginRegistry
