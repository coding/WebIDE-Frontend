import { registerAction } from 'utils/actions'
import { ExtensionsCache } from 'utils/extensions'
import store from './store'
import api from '../../backendAPI'


export const PLUGIN_REGISTER_VIEW = 'PLUGIN_REGISTER_VIEW'
export const PACKAGE_UPDATE_LIST = 'PACKAGE_UPDATE_LIST'

export const updatePackageList = registerAction(PACKAGE_UPDATE_LIST, () => {
  api.fetchPackageList()
  .then((result) => {
    store.list.concat(result)
  })
})


export const PACKAGE_UPDATE_LOCAL = 'PACKAGE_UPDATE_LOCAL'

// 往本地localstoage写一个插件的信息

export const updateLocalPackage = registerAction(PACKAGE_UPDATE_LOCAL, p => p)


export const PACKAGE_TOGGLE = 'PACKAGE_TOGGLE'
export const togglePackage = registerAction(PACKAGE_TOGGLE, (pkgId, shouldEnable) => {
  const script = localStorage.getItem(pkgId)
  if (!shouldEnable) {
    // plugin will unmount
    const extension = ExtensionsCache.get(pkgId)
    // window.extensions[pkgId].manager.pluginOnUnmount()
    extension.manager.pluginOnUnmount()
    ExtensionsCache.delete(pkgId)
    // delete window.extensions[pkgId]
  } else {
    // plugin will mount
    // @fixme @hackape consider theme situation
    try {
      eval(script) // <- from inside package, `codingPackageJsonp()` is called to export module
      const plugin = window.codingPackageJsonp.data // <- then it's access from `codingPackageJsonp.data`
      const { Manager = (() => null), key } = plugin
      const manager = new Manager()
      ExtensionsCache.set(key || pkgId, plugin)
      // window.extensions[pkgId] = plugin
      manager.pluginWillMount()
      plugin.manager = manager
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
(pkgId, pkgVersion, others) => ({ pkgId, pkgVersion, others }),
({ pkgId, pkgVersion, others }) => {
  const pkgInfo = api.fetchPackageInfo(pkgId, pkgVersion).then(pkg => pkg.codingIdePackage)
  const pkgScript = api.fetchPackageScript(pkgId, pkgVersion)
    .then((script) => {
      localStorage.setItem(pkgId, script)
      return pkgId
    })

  if (ExtensionsCache.get(pkgId)) { togglePackage(pkgId, false) }

  Promise.all([pkgInfo, pkgScript])
  .then(([pkg, id]) => {
    updateLocalPackage({
      ...pkg,
      ...others,
      enabled: Boolean(ExtensionsCache.get(pkgId)),
      id
    })
    togglePackage(pkgId, true)
  })
})

// export const PACKAGE_ACTIVATE_EXTENSION = 'PACKAGE_ACTIVATE_EXTENSION'
// export const activateExtenstion = createAction(PACKAGE_ACTIVATE_EXTENSION)

export const PRELOAD_REQUIRED_EXTENSION = 'PRELOAD_REQUIRED_EXTENSION'

export const preloadRequirePackages = registerAction(PRELOAD_REQUIRED_EXTENSION, () => {
  api.fetchPackageList()
    .then(list => list.filter(pkg => pkg.requirement === 'Required'))
    .then((list) => {
      list.forEach((pkg) => {
        fetchPackage(pkg.name, pkg.version, pkg)
      })
    })
})


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
    const { position, key, label, view, instanceId } = child
    const generateViewId = `${position}_${key}${instanceId ? `_${instanceId}` : ''}`
    store.labels.set(generateViewId, {
      viewId: generateViewId,
      position,
      key,
      ...label
    })
    store.views[generateViewId] = view
    if (callback) {
        // you can do other mapping such as status initialize in this callback
      callback(store, child)
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
  const extension = ExtensionsCache.get(label.key)
  const view = label.key && getComponent(extension, ExtensionsCache, store) // ge your package conteng get all package install cache, get the store

  return pluginRegister({
    position,
    key,
    label,
    view
  }, callback)
}
