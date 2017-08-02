import { observable } from 'mobx'

export const ExtensionsCache = {
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
  }
}

window.ExtensionsCache = ExtensionsCache

export const stateWithExtensions = (state = {}) => {
  state.extensions = ({
    labels: observable.map({}),
    views: {}
  })
  return state
}
