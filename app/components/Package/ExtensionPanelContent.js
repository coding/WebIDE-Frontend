/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'


const _ExtensionContainer = ({ extension, isActive }) => {
  const script = localStorage.getItem(extension.storageKey)
  let reactElement = eval(script) // <- this should be store in IDE Environment object
  return <div style={{display: isActive ? 'block' : 'none'}}>{reactElement}</div>
}

const ExtensionContainer = connect((state, { extension }) => {
  return { extension }
})(_ExtensionContainer)


const ExtensionPanelContent = ({ extensions, side, activeExtenstionId }) => {
  return (
    <div>{extensions.map((ext, idx) =>
      <ExtensionContainer key={ext.name}
        extension={ext}
        isActive={activeExtenstionId ? activeExtenstionId === ext.name : idx === 0}
      />
    )}</div>
  )
}

export default connect((state, { side }) => {
  const localPackages = state.PackageState.localPackages
  const { extensionIds, activeExtenstionId } = state.PackageState.extensionsUIState.panels[side]
  const extensions = extensionIds.map(id => localPackages[id])
  return { extensions, activeExtenstionId }
})(ExtensionPanelContent)
