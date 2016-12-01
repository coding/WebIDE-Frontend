import React from 'react'
import { connect } from 'react-redux'

const dic = {
  sideBar: ['./aaa']
}

const mapStateToProps = (state) => ({
  extensions: state.extensions
})

export const getExtensions = (template = []) => {
  const addonInsertComponent = ({ extensions }) => {
    const packages = window.extensions
    const addonName = template[0]
    if (packages[addonName]) {
      return packages[extensions[addonName]] || null
    }
    return null
  }
  return React.createElement(connect(mapStateToProps)(addonInsertComponent))
}

// addon`sideBar`
export const getLocalExtensionByName = (name) => {
  const extensionScript = localStorage.getItem(`extension_${name}`)
  if (extensionScript) return extensionScript
  return ''
}
