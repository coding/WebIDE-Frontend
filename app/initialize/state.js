import { extendObservable, observable } from 'mobx'
import config from '../config'
import api from '../backendAPI'
import { qs } from '../utils'
// import CodingSDK from '../CodingSDK'
import initializeState from '../containers/Initialize/state'

const urlPath = window.location.pathname
const qsParsed = qs.parse(window.location.search.slice(1))


const stepCache = observable.map({
  getSpaceKey: {
    desc: 'Get spaceKey from window.location',
    func: async () => {
    // case 0: isTry
      if (qsParsed.isTry) return true
    // case 1: spaceKey in url
      let spaceKey = null
      const wsPathPattern = /^\/ws\/([^/]+)\/?$/
      const match = wsPathPattern.exec(urlPath)
      if (match) spaceKey = match[1]
      if (spaceKey) return config.spaceKey = spaceKey

    // case 2: spaceKey in querystring
      spaceKey = qsParsed.spaceKey
      if (spaceKey) return config.spaceKey = spaceKey

      return true // MISSING OF SPACEKEY SHOULD NOT BLOCK
    }
  },
  checkExist: {
    desc: 'Check if workspace exist',
    enable: () => config.spaceKey,
    func: () => api.isWorkspaceExist()
  },
  setupWorkspace: {
    desc: 'Setting up workspace...',
    enable: () => config.spaceKey,
    func: () =>
      api.setupWorkspace().then((res) => {
        if (res.code) {
          initializeState.errorInfo = res.msg
          return false
        }
        extendObservable(config, res)
        if (config.project && config.project.name) { config.projectName = config.project.name }
        return true
      }).catch((res) => {
        if (res.msg) {
          initializeState.errorInfo = res.msg
        }
        return false
      })
  },
  getSettings: {
    desc: 'Get workspace settings',
    func: () =>
      api.getSettings().then(settings => config.settings = settings)
  },
  connectSocket: {
    desc: 'Connect websocket',
    func: () =>
      api.connectWebsocketClient()
  },
  preventAccidentalClose: {
    desc: 'Prevent accidental close',
    func: () => {
      window.onbeforeunload = function () {
        if (config.preventAccidentalClose) {
          return 'Do you really want to leave this site? Changes you made may not be saved.'
        }
        return void 0
      }
      return true
    }
  }
})

stepCache.insert = function (key, value, referKey, before = false) {
  let entries = this.entries()
  let insertIndex = entries.findIndex(entry => entry[0] === referKey)
  if (insertIndex < 0) {
    entries = entries.concat([key, value])
  } else {
    if (!before) insertIndex += 1
    entries.splice(insertIndex, 0, [key, value])
  }
  this.replace(entries)
}
// delete muliple keys
stepCache.delete = function (keys) {
  const keyArray = Array.isArray(keys) ? keys : [keys]
  keyArray.forEach((key) => {
    observable.map().delete.call(this, key)
  })
}
stepCache.move = function (key, referKey, before = false) {
  const entries = this.entries()
  let insertIndex = entries.findIndex(entry => entry[0] === referKey)
  const currentIndex = entries.findIndex(entry => entry[0] === key)
  if (insertIndex < 0) return
  const value = stepCache.get(key)
  if (!before) insertIndex += 1
  // 删除当前
  entries.splice(currentIndex, 1)
  // 新位置后插入
  entries.splice(insertIndex, 0, [key, value])
  this.replace(entries)
}

export default stepCache
