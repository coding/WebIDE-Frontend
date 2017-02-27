/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import _ from 'lodash'


const _ExtensionContainer = ({ extension, isActive }) => {
  const reactElement = window.extensions[extension.name].app
  // <- this should be store in window
  return (<div style={{ display: isActive ? 'block' : 'none' }}>
    {React.createElement(reactElement)}
  </div>)
}

const ExtensionContainer = connect((state, { extension }) => {
  return { extension }
})(_ExtensionContainer)


const ExtensionPanelContent = ({ extensions, side, activeExtenstionId }) => {
  return (
    <div>{extensions.map((ext, idx) =>
      <ExtensionContainer key={ext.id}
        extension={ext}
        isActive={activeExtenstionId ? activeExtenstionId === ext.id : idx === 0}
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
