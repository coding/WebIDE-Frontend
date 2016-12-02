import React from 'react'
import { connect } from 'react-redux'


const mapStateToProps = (state) => ({
  ExtensionState: state.ExtensionState,
})

export const getExtensions = (template = [], ...values) => {
  const addonInsertComponent = ({ ExtensionState, ...others }) => {
    const packages = window.extensions
    const addonName = template[0]
    const dom = packages[addonName]
    if (!dom || !ExtensionState.localExtensions[addonName]) return null
    return React.createElement(dom, others)
  }
  return React.createElement(connect(mapStateToProps)(addonInsertComponent), ...values)
}

// addon`sideBar`
export const getLocalExtensionByName = (name) => {
  const extensionScript = localStorage.getItem(`extension_${name}`)
  if (extensionScript) return extensionScript
  return ''
}
