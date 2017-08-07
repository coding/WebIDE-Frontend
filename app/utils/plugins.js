export const PluginsCache = {
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
window.PluginsCache = PluginsCache