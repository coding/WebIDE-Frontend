import React from 'react'
import { observer } from 'mobx-react'
import store from './store'
import { SIDEBAR } from './constants'

function getChildren (children) {
  if (!children) return []
  return Array.isArray(children) ? children : [children]
}


const PluginArea = observer(({ position = '', childProps = {}, children, getChildView, filter, ...others }) => {
  const pluginsArray = store.plugins.values().filter(plugin => plugin.position === position);
  // 如果侧边栏插件的数量超过 5 条，则只显示图标
  if (pluginsArray.filter(plugin => plugin.position === SIDEBAR.RIGHT).length > 5) {
    pluginsArray.map(plugin => {
      console.log(plugin.label)
      if (plugin.position === SIDEBAR.RIGHT && plugin.label && typeof plugin.label === 'object') {
        plugin.label.onlyIcon = true;
      }
      return plugin;
    });
  }
  if (pluginsArray.filter(plugin => plugin.position === SIDEBAR.LEFT).length > 5) {
    pluginsArray.map(plugin => {
      if (plugin.position === SIDEBAR.LEFT && plugin.label && typeof plugin.label === 'object') {
        plugin.label.onlyIcon = true;
      }
      return plugin;
    });
  }
  if (pluginsArray.filter(plugin => plugin.position === SIDEBAR.BOTTOM).length > 5) {
    pluginsArray.map(plugin => {
      if (plugin.position === SIDEBAR.BOTTOM && plugin.label && typeof plugin.label === 'object') {
        plugin.label.onlyIcon = true;
      }
      return plugin;
    });
  }

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
