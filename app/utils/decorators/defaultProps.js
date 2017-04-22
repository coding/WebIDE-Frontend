import React from 'react'

function getDisplayName (WrappedComponent) {
  return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export default function defaultProps (propsMapper) {

  return function decorator (WrappedComponent) {
    const displayName = getDisplayName(WrappedComponent)

    function WrapperComponent (props) {
      const mergedProps = { ...propsMapper(props), ...props }
      return React.createElement(WrappedComponent, mergedProps)
    }

    WrapperComponent.displayName = displayName
    WrapperComponent.WrappedComponent = WrappedComponent
    return WrapperComponent
  }
}

