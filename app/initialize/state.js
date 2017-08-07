import { extendObservable, observable } from 'mobx'
import config from '../config'
import api from '../backendAPI'
import { qs, stepFactory, i18n, request } from '../utils'
import store, { dispatch } from '../store'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'
import { loadPackagesByType } from '../components/Plugins/actions'
// import CodingSDK from '../CodingSDK'
import initializeState from '../containers/Initialize/state'

const urlPath = window.location.pathname
const qsParsed = qs.parse(window.location.search.slice(1))


const stepCache = observable.map({
  getSpaceKey: {
    key: 'GetSpaceKeyFromLocation',
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

    // case 3: get spaceKey by ownerName and projectName
      const { ownerName, projectName } = qsParsed
      if (config.isPlatform && ownerName && projectName) {
        spaceKey = await api.findSpaceKey({ ownerName, projectName })
        if (spaceKey) {
          config.spaceKey = spaceKey
          const redirectUrl = `${location.origin}/ws/${config.spaceKey}`
          if (window.history.pushState) {
            window.history.pushState(null, null, redirectUrl)
          } else {
            window.location = redirectUrl
          }
          return true
        }
      }
      return true // MISSING OF SPACEKEY SHOULD NOT BLOCK
    }
  },
  checkExist: {
    key: 'checkExist',
    desc: 'Check if workspace exist',
    enable: () => config.spaceKey,
    func: () => api.isWorkspaceExist()
  },
  setupWorkspace: {
    key: 'setupWorkspace',
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
    key: 'getSettings',
    desc: 'Get workspace settings',
    enable: !config.isPlatform,
    func: () =>
      api.getSettings().then(settings => config.settings = settings)
  },
  connectSocket: {
    key: 'connectSocket',
    desc: 'Connect websocket',
    func: () =>
      api.connectWebsocketClient()
  },
})


const manager = observable([
  'getSpaceKey',
  'setupWorkspace',
  'getSettings',
  'connectSocket'
])


export default { manager, stepCache }
