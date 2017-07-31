import React from 'react'
import { connect } from 'react-redux'
import { observable } from 'mobx'

const mapStateToProps = state => ({
  ExtensionState: state.ExtensionState,
})

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

// addon`sideBar`
export const getLocalExtensionByName = (name) => {
  const extensionScript = localStorage.getItem(`extension_${name}`)
  if (extensionScript) return extensionScript
  return ''
}

export const stateWithExtensions = (state = {}) => {
  state.extensions = ({
    labels: observable.map({}),
    views: {}
  })
  return state
}
