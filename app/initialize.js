import React from 'react'
import { bindActionCreators } from 'redux'
import { extendObservable } from 'mobx'
import config from './config'
import api from './backendAPI'
import { qs, stepFactory, createI18n, getExtensions, request } from './utils'
import * as Modal from './components/Modal/actions'
import store, { dispatch } from './store'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { preloadRequirePackages } from './components/Package/actions'
import CodingSDK from './CodingSDK'


async function initialize () {
  const step = stepFactory()
  const urlPath = window.location.pathname
  let stepNum = 0

  await step(`[${stepNum++}] Get spaceKey from window.location`, async () => {
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
    if (!config.isPlatform) {
      await step(`[${stepNum++}] Check if workspace exist`, () =>
        api.isWorkspaceExist()
      )
    }
    await step(`[${stepNum++}] Setting up workspace...`, () =>
      api.setupWorkspace().then((res) => {
        extendObservable(config, res)
        if (config.project && config.project.name) { config.projectName = config.project.name }
        return true
      })
    )
  } else {
    await step(`[${stepNum++}] Try create workspace`, () => {
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
    await step(`[${stepNum++}] Get workspace settings`, () =>
      api.getSettings().then(settings => config.settings = settings)
    )
  }

  if (config.isPlatform) {
    await step(`[${stepNum++}] Get user globalKey`, () =>
      api.getUserProfile().then(({ global_key }) => {
        config.globalKey = global_key
        return true
      })
    )
  }

  /* @TODO: websocket connection is not a must, shouldn't block
   * also, terminal connection is optional, only connect when terminal panel is shown
   * */
  await step(`[${stepNum++}] Connect websocket`, () =>
    api.connectWebsocketClient()
  )

  await step(`[${stepNum++}] Expose essential APIs into window object`, () => {
    window.CodingSDK = CodingSDK
    window.store = store
    window.React = React
    window.i18n = createI18n
    window.extensions = {}
    window.extension = f => getExtensions
    window.refs = {}
    window.config = config
    return true
  })


  if (__DEV__ && __PACKAGE_SERVER__) {
    await step(`[${stepNum++}] enable package server hotreload`, () => {
      api.enablePackageHotReload()
      return true
    })
  }

  await step(`[${stepNum++}] load required packages`, () => {
    dispatch(preloadRequirePackages())
  })
}

export default initialize
