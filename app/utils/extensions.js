import React from 'react'
import { connect } from 'react-redux'


const mapStateToProps = state => ({
  ExtensionState: state.ExtensionState,
})

export const getExtensions = (template = [], ...values) => {
  const addonInsertComponent = ({ ExtensionState, ...others }) => {
    const placeHolder = template[0]
    const addonName = Object.keys(ExtensionState.localExtensions).find(e => ExtensionState.localExtensions[e].config.placeHolder === placeHolder)
    const packages = window.extensions
    if (!addonName || !packages[addonName] || !ExtensionState.localExtensions[addonName]) return null
    return React.createElement(packages[addonName], others)
  }
  return React.createElement(connect(mapStateToProps)(addonInsertComponent), ...values)
}

// addon`sideBar`
export const getLocalExtensionByName = (name) => {
  const extensionScript = localStorage.getItem(`extension_${name}`)
  if (extensionScript) return extensionScript
  return ''
}
