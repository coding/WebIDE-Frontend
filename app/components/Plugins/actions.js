import { registerAction } from 'utils/actions'
import { PluginRegistry } from 'utils/plugins'
import { autorun, observable } from 'mobx'
import config from 'config'
import { notify, NOTIFY_TYPE } from 'components/Notification/actions'
import store from './store'
import api from '../../backendAPI'

const io = require(__RUN_MODE__ ? 'socket.io-client/dist/socket.io.min.js' : 'socket.io-client-legacy/dist/socket.io.min.js')

export const PLUGIN_REGISTER_VIEW = 'PLUGIN_REGISTER_VIEW'
export const PLUGIN_UNREGISTER_VIEW = 'PLUGIN_UNREGISTER_VIEW'
export const PACKAGE_UPDATE_LIST = 'PACKAGE_UPDATE_LIST'

export const updatePackageList = registerAction(PACKAGE_UPDATE_LIST, () => {
  api.fetchPackageList()
  .then((result) => {
    store.list.replace(result.map(e => {
      const current = store.list.find(obj => obj.name === e.name)
      return ({ enabled: current ? current.enabled || false : false, userPlugin: false, ...e })
    }))
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
      window.codingPackageJsonp.current = pkgId
      eval(`${script}`) // <- from inside package, `codingPackageJsonp()` is called to export module
      // codingPackageJsonp 注册的可以是单个插件或者插件组, 每个插件的key必须不同
      const plugin = window.codingPackageJsonp.data // <- then it's access from `codingPackageJsonp.data`
      window.codingPackageJsonp.current = ''
      const pluginArray = Array.isArray(plugin) ? plugin : [plugin]
      pluginArray
      .sort((pgkA, pgkB) => (pgkA.weight || 0) < (pgkB.weight || 0) ? 1 : -1)
      .forEach((plugin) => {
        const { Manager = (() => null), key } = plugin
        const manager = new Manager()
        plugin.detaultInstance = manager
        const getInfo = info || {}
        PluginRegistry.set(key || pkgId, { ...plugin, pkgId, info: getInfo, loadType: type })
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
export const FETCH_PACKAGE_GROUP = 'FETCH_PACKAGE_GROUP'


export const fetchPackageGroup = registerAction(FETCH_PACKAGE_GROUP,
(groupName, pkgs, type, data) => ({ groupName: `group_${groupName}`, pkgs, type, data }),
({ groupName, pkgs, type, data }) => {
  const scriptArguments = pkgs.map((pkg => ({ pkgName: pkg.name, pkgVersion: pkg.version, target: pkg.TARGET })))
  return api.fetchPackageScript(scriptArguments)
  .then((script) => {
    localStorage.setItem(groupName, script)
    codingPackageJsonp.groups[groupName] = pkgs.map(pkg => pkg.name)
    // Todo: refractor the toggle package model
    // return togglePackage({ pkgId: groupName, shouldEnable: !PluginRegistry.find(groupName), type, data })
    return togglePackage({ pkgId: groupName, shouldEnable: true, type, data })
  })
}
)

export const fetchPackage = registerAction(FETCH_PACKAGE,
(pkg, type, data) => ({ pkg, type, data }),
({ pkg, type, data }) => api.fetchPackageScript({ pkgName: pkg.name, pkgVersion: pkg.version, target: pkg.TARGET })
  .then((script) => {
    localStorage.setItem(pkg.name, script)
    return pkg.name
  })
  .then(pkgId => togglePackage({ pkgId, shouldEnable: true, type, data })))


export const PRELOAD_REQUIRED_EXTENSION = 'PRELOAD_REQUIRED_EXTENSION'

export const PRELOAD_USER_EXTENSION = 'PRELOAD_USER_EXTENSION'

// 插件申明加载时机，
export const loadPackagesByType = registerAction(PRELOAD_REQUIRED_EXTENSION,
  // type is the packages type, data is the state data , group is the batch
  (type, data = {}, group) => ({ type, data, group }),
  ({ type, data, group }) => {
    const fetchPackgeListPromise = api.fetchPackageList(type)
    return fetchPackgeListPromise.then(async (list) => {
      if (config.isLib) {
        const filterList = list.filter((item) => {
          return item.name !== 'platform' && item.name !== 'Debugger' && item.name !== 'collaboration'
        })
        store.list.replace(filterList)
      } else {
        store.list.replace(list)
      }
      if (group) {        
        return fetchPackageGroup('required', store.list, type, data)
      }
      for (const pkg of filterList) {
        await fetchPackage(pkg, type, data)
      }
    })
  }
)

const FETCH_USER_PACKAGE = 'FETCH_USER_PACKAGE'

export const fetchUserPackage = registerAction(FETCH_USER_PACKAGE, (pkg) => {
  return api.fetchUserPackageScript(pkg.filePath)
    .then((script) => {
      localStorage.setItem(pkg.name, script)
      return pkg.name
    })
    .then(pkgId => togglePackage({ pkgId, shouldEnable: true, type: 'Required' }))
    .catch(err => {
      throw new Error(err.message)
    })
})

const loadUserPackages = (packages) => {
  const convertTasks = packages.map((p) => ({
    name: p.pluginName,
    author: p.createdBy || '',
    description: p.remark,
    displayName: p.pluginName,
    enabled: true,
    id: p.id,
    requirement: 'Required',
    status: 'Available',
    version: p.currentVersion || '[pre deploy]',
    userPlugin: true,
    filePath: p.pluginFilePath
  }))
  .map((pkg) => {
    store.list.push(pkg)
    console.log(`[Plugin] Load ${pkg.name}...`)
    return fetchUserPackage(pkg)
  })

  return Promise.all(convertTasks)
    .then((_) => {
    })
    .catch((err) => {
      throw new Error(err.message)
    })

  /* eslint-disable */
  // for (const pkg of convertTasks) {
  //   store.list.push(pkg)
  //   fetchUserPackage(pkg)
  //     .then(() => {
  //       console.log(`[Plugin-${pkg.name}] load success.`)
  //     })
  //     .catch((err) => {
  //       console.error(`Failed to load plugin ${pkg.name}: ${err.message}.`)
  //     })
  // }
}

export const loadPackagesByUser = registerAction(PRELOAD_USER_EXTENSION, () => {
  const userPackagePromise = api.fetchUserPackagelist()
  const preDeployPackagePromise = api.fethUserPreDeployPlugins()
  return Promise.all([userPackagePromise, preDeployPackagePromise])
    .then(async ([userpackages, preDeployPackages]) => {
      const userPlugins = userpackages.data
      const preDeployPlugins = preDeployPackages.data
      // 同一插件（Id 相同）不同版本（正式版、预发布）同时加载，只加载预发布版本
      const enableUserPackages = userPlugins.reduce((pre, cur) => {
        if (!preDeployPlugins.find(prePackage => prePackage.id === cur.id)) {
          pre.push(cur)
        }
        return pre
      }, [])
      store.preDeployPlugins = preDeployPlugins

      loadUserPackages([...enableUserPackages, ...preDeployPlugins])
    })
})

export const mountPackagesByType = (type) => {
  const plugins = PluginRegistry.findAllByType(type)
  plugins.forEach((plugin) => {
    plugin.detaultInstance.pluginWillMount(plugin)
  })
}

export const mountPackage = (id, unMount) => {
  const plugin = PluginRegistry.find(id)
  if (unMount) {
    plugin.detaultInstance.pluginWillUnmount(plugin)
  } else {
    plugin.detaultInstance.pluginWillMount(plugin)
  }
}

export const hydrate = (requiredList) => {
  requiredList.forEach((element) => {
    fetchPackage(element).then(({ id }) => mountPackage(id))
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
    const { position, key, label, view, app, instanceId, status } = child
    const generateViewId = `${position}.${key}${instanceId ? `.${instanceId}` : ''}`
    store.plugins.set(generateViewId, observable({
      // 可修改位置
      viewId: generateViewId,
      position,
      key,
      label,
      app,
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

const wsUrl = config.wsURL
const firstSlashIdx = wsUrl.indexOf('/', 8)
const [host, path] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]

/**
 * 连接到远程 hmr 
 */
export const startRemoteHMRServer = registerAction('plugin:mount', () => {
  const devSocket = io.connect(host, {
    forceNew: true,
    reconnection: false,
    autoConnect: true,
    transports: ['websocket'],
    path: `${path}/tty/${config.shardingGroup}/${config.spaceKey}/connect-other-service`,
    query: {
      port: 65000
    }
  })

  devSocket.on('connect_error', () => {
    notify({ notifyType: NOTIFY_TYPE.ERROR, message: '无法连接到插件服务，请确保已经执行 yarn start 且正常启动' })
  })

  devSocket.on('progress', (progress) => {
    store.pluginDevState.progress = progress
  })

  devSocket.on('connect', () => {
    notify({
      notifyType: NOTIFY_TYPE.INFO,
      message: '连接成功'
    })

    store.pluginDevState.online = true
    devSocket.on('firstsend', ({ codingPackage, script }) => {
      const packageUniqueName = `${codingPackage.name}_${codingPackage.version}`
      const plugins = PluginRegistry.findAll(packageUniqueName)
      if (!plugins || plugins.length === 0) {
        try {
          window.codingPackageJsonp.current = packageUniqueName
          eval(`${script}`)
          window.codingPackageJsonp.current = ''
          const plugin = window.codingPackageJsonp.data[0]
          const { Manager = (() => null), key } = plugin
          const manager = new Manager()
          plugin.detaultInstance = manager
          const getInfo = store.list.get(key || packageUniqueName) || {}
          PluginRegistry.set(key || packageUniqueName, { ...plugin, pkgId: packageUniqueName, info: getInfo, loadType: 'Required' })
          manager.pluginWillMount()
          localStorage.setItem(packageUniqueName, script)
          firstPending = false
        } catch (e) {
          console.error(e)
        }
      }
    })

    registerAction('plugin:unmount', () => {
      const { infomation: { name, version } } = store.pluginDevState
      togglePackage({ pkgId: `${name}_${version}`, shouldEnable: false })
      devSocket.disconnect()
    })

    registerAction('plugin:remount', () => {
      const { infomation: { name, version } } = store.pluginDevState
      togglePackage({ pkgId: `${name}_${version}`, shouldEnable: false })
      devSocket.disconnect()

      const timer = setTimeout(() => {
        clearTimeout(timer)
        startRemoteHMRServer()
      }, 500)
    })
    devSocket.on('hmrfile', ({ codingPackage, script }) => {
      const packageUniqueName = `${codingPackage.name}_${codingPackage.version}`
      const plugins = PluginRegistry.findAll(packageUniqueName)
      if (plugins && plugins.length > 0) {
        plugins.forEach((plugin) => {
          if (plugin.detaultInstance.pluginWillUnmount) {
            plugin.detaultInstance.pluginWillUnmount()
          }
          PluginRegistry.delete(plugin.key)
        })
      }
      localStorage.setItem(packageUniqueName, script)
      togglePackage({ pkgId: packageUniqueName, shouldEnable: true, type: 'reload', data: null })
    })
  })

  devSocket.on('disconnect', () => {
    notify({
      notifyType: NOTIFY_TYPE.INFO,
      message: '插件已断开连接'
    })
    store.pluginDevState.online = false
    const { infomation: { name, version } } = store.pluginDevState
    togglePackage({ pkgId: `${name}_${version}`, shouldEnable: false })
  })
  devSocket.on('change', (message) => {
    const { codingIdePackage } = message
    store.pluginDevState.infomation = codingIdePackage
    devSocket.emit('readfile', { name: codingIdePackage.name, version: codingIdePackage.version })
  })
})

export const pluginUnRegister = registerAction(PLUGIN_UNREGISTER_VIEW,
(children, callback = '') => ({ children, callback }),
({ children, callback }) => {
  const childrenArray = Array.isArray(children) ? children : [children]
  childrenArray.forEach((child) => {
    const { position, key, instanceId } = child
    const generateViewId = `${position}.${key}${instanceId ? `.${instanceId}` : ''}`
    store.plugins.delete(generateViewId)
    delete store.views[generateViewId]
    if (callback) {
      callback(store.plugins)
    }
  })
}
)

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
//  */
export const injectComponent = (position, label, getComponent, callback) => {
  const key = label.key
  const extension = PluginRegistry.get(key)
  const view = key && getComponent && getComponent(extension || {}, PluginRegistry, store)// ge your package conteng get all package install cache, get the store
  let app;
  Object.values(PluginRegistry._plugins).forEach(plugin => {
    if (label.mime && key === plugin.key) {
      app = plugin.app;
    }
  });

  return pluginRegister({
    position,
    key,
    label,
    view,
    app,
  }, callback)
}
