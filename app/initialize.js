import React from 'react'
import qs from 'qs'
import { bindActionCreators } from 'redux'
import config from './config'
import api from './backendAPI'
import { stepFactory, createI18n, getExtensions, request } from './utils'
import * as Modal from './components/Modal/actions'
import store, { dispatch } from './store'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { preloadRequirePackages } from './components/Package/actions'
import CodingSDK from './CodingSDK'


async function initialize () {
  const step = stepFactory()
  const urlPath = window.location.pathname

  await step('[0] Get spaceKey from window.location', () => {
    let spaceKey = null
    if (config.isPlatform) {
      const wsPathPattern = /^\/ws\/([^\/]+)$/
      const match = wsPathPattern.exec(urlPath)
      if (match) spaceKey = match[1]
    }
    if (!spaceKey) spaceKey = qs.parse(window.location.hash.slice(1)).spaceKey
    if (spaceKey) config.spaceKey = spaceKey
    return true
  })

  if (config.spaceKey) {
    await step('[1] Check if workspace exist', () =>
      api.isWorkspaceExist()
    )
    await step('[2] Setting up workspace...', () =>
      api.setupWorkspace().then(res => {
        Object.assign(config, res)
        if (config.project && config.project.name) { config.projectName = config.project.name }
        return true
      })
    )
  } else {
    await step('[1] Try create workspace', () => {
      const queryEntryPathPattern = /^\/ws\/?$/
      const isFromQueryEntryPath = queryEntryPathPattern.test(urlPath)
      if (isFromQueryEntryPath) {
        const parsed = qs.parse(location.search)
        config.openFile = parsed.openFile
        const options = {
          ownerName: parsed.ownerName,
          projectName: parsed.projectName,
          host: parsed.host,
        }
        if (parsed.envId) options.envId = parsed.envId
        if (parsed.isTry) options.try = true
        return api.createWorkspace(options).then(res => {
          Object.assign(config, res)
          if (config.project && config.project.name) { config.projectName = config.project.name }
          if (history.pushState) {
            history.pushState(null, null,
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

  await step('[4] Connect websocket', () =>
    api.connectWebsocketClient()
  )

  await step('[5] Expose essential APIs into window object', () => {
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

  /*
  if (__PACKAGE_SERVER__) {
    await step('[6] enable package server hotreload', () => {
      api.enablePackageHotReload()
      return true
    })
  }
  */

  await step('[7] load required packages', () => {
    dispatch(preloadRequirePackages())
  })
}

export default initialize
