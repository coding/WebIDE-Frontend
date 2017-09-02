import { registerAction } from 'utils/actions'
import { PluginRegistry } from 'utils/plugins'
import { autorun, observable } from 'mobx'
import config from 'config'
import store from './store'
import api from '../../backendAPI'


export const PLUGIN_REGISTER_VIEW = 'PLUGIN_REGISTER_VIEW'
export const PACKAGE_UPDATE_LIST = 'PACKAGE_UPDATE_LIST'

export const updatePackageList = registerAction(PACKAGE_UPDATE_LIST, () => {
  api.fetchPackageList()
  .then((result) => {
    store.list.replace(result)
  })
})


export const PACKAGE_UPDATE_LOCAL = 'PACKAGE_UPDATE_LOCAL'

// 往本地localstoage写一个插件的信息

export const updateLocalPackage = registerAction(PACKAGE_UPDATE_LOCAL, p => p)

export const PACKAGE_TOGGLE = 'PACKAGE_TOGGLE'

export const togglePackage = registerAction(PACKAGE_TOGGLE,
({ pkgId, shouldEnable, info, type, data }, action) => {
  const script = localStorage.getItem(pkgId) // toggle行为从本地读取
  if (!shouldEnable) {
    // plugin will unmount
    // 根据 package Id 把所有此插件组的插件拔掉
    const plugins = PluginRegistry.findAll(pkgId)
    plugins.forEach((plugin) => {
      if (plugin.detaultInstance.pluginWillUnmount) {
        plugin.detaultInstance.pluginWillUnmount()
      }
      PluginRegistry.delete(plugin.key)
    })
  } else {
    // plugin will mount
    // @fixme @hackape consider theme situation
    try {
      eval(script) // <- from inside package, `codingPackageJsonp()` is called to export module
      // codingPackageJsonp 注册的可以是单个插件或者插件组, 每个插件的key必须不同
      const plugin = window.codingPackageJsonp.data // <- then it's access from `codingPackageJsonp.data`
      const pluginArray = Array.isArray(plugin) ? plugin : [plugin]
      pluginArray
      .sort((pgkA, pgkB) => (pgkA.weight || 0) < (pgkB.weight || 0) ? 1 : -1)
      .forEach((plugin) => {
        const { Manager = (() => null), key } = plugin
        const manager = new Manager()
        plugin.detaultInstance = manager
        PluginRegistry.set(key || pkgId, { ...plugin, pkgId, info, loadType: type })
        if (manager.init) {
            manager.init(data, action)
        }
        if (type === 'reload') {
          manager.pluginWillMount()
        }
        // if (type === 'init') {
        //   if (manager.init) {
        //     manager.init(data, action)
        //   }
        // } else {
        // // mount 生命周期挂载时触发
        //   manager.pluginWillMount(config, data)
        // }
        // 提供 autorun生命周期，插件关注 主项目config 声明周期点变化后自动执行

        // if (manager.autoRun) {
        //   autorun(manager.autoRun)
        // }

        // // render 提供渲染方法，60帧刷新方法，可用来画图
        // if (manager.render) {
        //   setInterval(manager.render, 50 / 3)
        // }
      })
    } catch (err) {
      throw err
    }
  }
  return ({
    id: pkgId,
    shouldEnable,
  })
})

export const FETCH_PACKAGE = 'FETCH_PACKAGE'

export const fetchPackage = registerAction(FETCH_PACKAGE,
(pkg, type, data) => ({ pkg, type, data }),
async ({ pkg, type, data }) => {
  const pkgInfo = api.fetchPackageInfo(pkg.name, pkg.version, pkg.TARGET)
  .then(pkg => pkg.codingIdePackage)
  const pkgScript = api.fetchPackageScript(pkg.name, pkg.version, pkg.TARGET)
    .then((script) => {
      localStorage.setItem(pkg.name, script)
      return pkg.name
    })


  await Promise.all([pkgInfo, pkgScript])
  .then(async ([info, pkgId]) => {
    if (PluginRegistry.find(pkgId)) {
      await togglePackage({ pkgId, info, shouldEnable: false, type, data })
    }
    await togglePackage({ pkgId, shouldEnable: true, type, info, data })
  })
})


export const PRELOAD_REQUIRED_EXTENSION = 'PRELOAD_REQUIRED_EXTENSION'

// 插件申明加载时机，
export const loadPackagesByType = registerAction(PRELOAD_REQUIRED_EXTENSION,
  (type, data = {}) => ({ type, data }),
  ({ type, data }) => {
    const fetchPackgeListPromise = type === 'Required' ? api.fetchRequiredPackageList() : api.fetchPackageList()
    return fetchPackgeListPromise.then(async (list) => {
      for (const pkg of list) {
        await fetchPackage(pkg, type, data)
      }
    })
  }
)

export const mountPackagesByType = (type) => {
  const plugins = PluginRegistry.findAllByType(type)
  plugins.forEach((plugin) => {
    plugin.detaultInstance.pluginWillMount(plugin)
  })
}

export const loadPlugin = (plugin) => {
  const { Manager = (() => null), key } = plugin
  const manager = new Manager()
  plugin.detaultInstance = manager
  PluginRegistry.set(key, { ...plugin, pkgId: 'inner plugin', info: plugin.info || {} })
  manager.pluginWillMount(config)
}
/**
 * @param  { position label getComponent callback } children // children is the shape of per component

 * @param  {} callback // spec per plugin inject func
 */

export const pluginRegister = registerAction(PLUGIN_REGISTER_VIEW,
(children, callback = '') => ({ children, callback }),
({ children, callback }) => {
  const childrenArray = Array.isArray(children) ? children : [children]
  childrenArray.forEach((child) => {
    // children 的 shape
    const { position, key, label, view, instanceId, status } = child
    const generateViewId = `${position}.${key}${instanceId ? `.${instanceId}` : ''}`
    store.plugins.set(generateViewId, observable({
      // 可修改位置
      viewId: generateViewId,
      position,
      key,
      label,
      status: status || observable.map({}),
      actions: observable.ref(label.actions || {})
    }))
    store.views[generateViewId] = view
    if (callback) {
        // you can do other mapping such as status initialize in this callback
      callback(store.plugins.get(generateViewId), child, store)
    }
  })
})


/**
 * @param  {} position // the position is the plugin inject position
 * @param  {} label // per plugin description
 * @param  {} getComponent // get component func
 * @param  {} callback // spec per plugin inject func
 * @return  type injectComponent
 * @param  {} constview=label.key&&getComponent(extension
 * @param  {} returnpluginRegister({position
 * @param  {} key
 * @param  {} label
 * @param  {} view}
 * @param  {} callback
 */
export const injectComponent = (position, label, getComponent, callback) => {
  const key = label.key
  const extension = PluginRegistry.get(label.key)
  const view = label.key && getComponent(extension, PluginRegistry, store) // ge your package conteng get all package install cache, get the store

  return pluginRegister({
    position,
    key,
    label,
    view
  }, callback)
}
