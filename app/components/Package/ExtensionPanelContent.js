/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'

const ExtensionPanelContent = ({ extensions, side }) => {
  let elem = _.map(extensions, ext => {
    return <ExtensionContainer key={ext.name} extension={ext} />
  })
  return (
    <div>
      {elem}
    </div>
  )
}

const _ExtensionContainer = ({ extension }) => {
  const script = localStorage.getItem(extension.storageKey)
  let reactElement = eval(script) // <- this should be store in IDE Environment object
  console.log(reactElement)
  return <div >{reactElement}</div>
}

const ExtensionContainer = connect((state, { extension }) => {
  return { extension }
})(_ExtensionContainer)

export default connect(state => {
  const localPackages = state.PackageState.localPackages
  const extensions = Object.keys(localPackages).reduce((extensions, pkgName) => {
    const pkg = localPackages[pkgName]
    if (pkg.type === 'extension' && pkg.enabled) {
      extensions[pkgName] = pkg
    }
    return extensions
  }, {})
  return { extensions }
})(ExtensionPanelContent)
