import React from 'react'
import { extendObservable } from 'mobx'
import config from './config'
import api from './backendAPI'
import { qs, stepFactory, i18n, request } from './utils'
import store, { dispatch } from './store'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { loadPackagesByType } from './components/Plugins/actions'
import CodingSDK from './CodingSDK'
import initializeState from './containers/Initialize/state'


async function initialize () {
  const step = stepFactory()
  const urlPath = window.location.pathname

  await step('[0] Get spaceKey from window.location', async () => {
    // case 1: spaceKey in url
    let spaceKey = null
    const wsPathPattern = /^\/ws\/([^/]+)\/?$/
    const match = wsPathPattern.exec(urlPath)
    if (match) spaceKey = match[1]
    if (spaceKey) return config.spaceKey = spaceKey

    // case 2: spaceKey in querystring
    const qsParsed = qs.parse(window.location.search.slice(1))
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
  })

  if (config.spaceKey) {
    await step('[1] Check if workspace exist', () =>
      api.isWorkspaceExist()
    )
    await step('[2] Setting up workspace...', () =>
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
    )
    // .error(() => {
    //   initializeState.errorInfo = 'An error was encountered'
    //   return false
    // })
  } else {
    await step('[1] Try create workspace', () => {
      const queryEntryPathPattern = /^\/ws\/?$/
      const isFromQueryEntryPath = queryEntryPathPattern.test(urlPath)
      if (isFromQueryEntryPath) {
        const qsParsed = qs.parse(location.search.substring(1))
        config.openFile = qsParsed.openFile
        const options = {
          ownerName: qsParsed.ownerName,
          projectName: qsParsed.projectName,
          host: qsParsed.host,
          cpuLimit: 1,
          memory: 128,
          storage: 1
        }
        if (qsParsed.envId) options.envId = qsParsed.envId
        if (qsParsed.isTry) options.try = true
        return api.createWorkspace(options).then((res) => {
          extendObservable(config, res)
          if (config.project && config.project.name) { config.projectName = config.project.name }
          if (window.history.pushState) {
            window.history.pushState(null, null,
              `${location.origin}/ws/${config.spaceKey}`)
          }
          return true
        })
      }
      return false
    })
  }

  if (!config.isPlatform) {
    await step('[3] Get workspace settings', () =>
      api.getSettings().then(settings => config.settings = settings)
    )
  }

  if (config.isPlatform) {
    await step('[3] Get user globalKey', () =>
      api.getUserProfile().then(({ global_key }) => {
        config.globalKey = global_key
        return true
      })
    )
  }

  /* @TODO: websocket connection is not a must, shouldn't block
   * also, terminal connection is optional, only connect when terminal panel is shown
   * */
  await step('[4] Connect websocket', () =>
    api.connectWebsocketClient()
  )

  await step('[5] Expose essential APIs into window object', () => {
    window.CodingSDK = CodingSDK
    window.store = store
    window.React = React
    window.i18n = i18n
    window.extension = f => null
    window.refs = {}
    window.config = config
    return true
  })


  if (config.packageDev) {
    await step('[6] enable package server hotreload', () => {
      api.enablePackageHotReload()
      return true
    })
  }

  await step('[7] load required packages', () => {
    loadPackagesByType('Required')
    return true
  })

  return step
}

export default initialize
