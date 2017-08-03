import React from 'react'
import { observer } from 'mobx-react'
import store from './store'

function getChildren (children) {
  if (!children) return []
  return Array.isArray(children) ? children : [children]
}


const PluginArea = observer(({ position = '', childProps = {}, children, ...others }) => {
  const pluginsArray = store.labels.values().filter(label => label.position === position)

  const pluginComponents = pluginsArray
  .sort((labelA, labelB) => labelA.weight || labelB.weight < 1 || 1 ? -1 : 1)
  .map(label => React.createElement(store.views[label.viewId], {
    key: label.viewId,
    ...childProps,
  }))
  // 允许提供children的必有不可插拔项
  return (
    <div {...others}>
      {getChildren(children).concat(pluginComponents)}
    </div>
  )
})


export default PluginArea
