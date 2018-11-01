import React from 'react'
import { observer } from 'mobx-react'
import store from './store'

function getChildren (children) {
  if (!children) return []
  return Array.isArray(children) ? children : [children]
}


const PluginArea = observer(({ position = '', childProps = {}, children, getChildView, filter, ...others }) => {
  const pluginsArray = store.plugins.values().filter(plugin => plugin.position === position)

  const pluginComponents = pluginsArray
  .filter(filter || (() => true))
  .sort((pluginA, pluginB) => (pluginA.label.weight || 0) < (pluginB.label.weight || 0) ? 1 : -1)
  .map((plugin) => {
    const view = store.views[plugin.viewId]
    return !!view ? getChildView ? getChildView(plugin, view) :
     React[React.isValidElement(view) ? 'cloneElement' : 'createElement'](view, {
       key: plugin.viewId,
       ...childProps,
     }) : null
  })
  // 允许提供children的必有不可插拔项
  return (
    <div {...others}>
      {getChildren(children).concat(pluginComponents)}
    </div>
  )
})


export default PluginArea
