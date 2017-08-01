import React from 'react'
import { ExtensionsCache } from 'utils/extensions'
import { bindActionCreators } from 'redux'
import { extendObservable } from 'mobx'
import config from './config'
import api from './backendAPI'
import { qs, stepFactory, i18n, request } from './utils'
import * as Modal from './components/Modal/actions'
import store, { dispatch } from './store'
import { notify, NOTIFY_TYPE } from './components/Notification/actions'
import { preloadRequirePackages } from './components/Package/actions'
import CodingSDK from './CodingSDK'
import initializeState from './containers/Initialize/state'


async function initialize () {
  const step = stepFactory()
  const urlPath = window.location.pathname
  let stepNum = 0
  const qsParsed = qs.parse(window.location.search.slice(1))

  await step(`[${stepNum++}] Get spaceKey from window.location`, async () => {
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
  })

  if (config.spaceKey) {
    if (!config.isPlatform) {
      await step(`[${stepNum++}] Check if workspace exist`, () =>
        api.isWorkspaceExist()
      )
    }
    await step(`[${stepNum++}] Setting up workspace...`, () =>
      api.setupWorkspace().then((res) => {
        if (res.code) {
          if (res.code === 403) {
            return api.getUserProfile().then((userRes) => {
              if (userRes.code === 1000) {
                location.href = `/login?return_url=${location.href}`
              } else if (userRes.code === 0) {
                return api.fetchRqeuestState().then((stateRes) => {
                  initializeState.errorCode = res.code
                  initializeState.status = stateRes.status
                  return false
                }).catch((catchRes) => {
                  if (catchRes.code === 404) {
                    initializeState.errorCode = catchRes.code
                    initializeState.errorInfo = res.msg
                  } else {
                    initializeState.errorCode = res.code
                    initializeState.errorInfo = res.msg
                  }
                  return false
                })
              }
            })
          } else {
            initializeState.errorCode = res.code
            initializeState.errorInfo = res.msg
            return false
          }
        } else if (res.durationStatus === 'Temporary' && res.ttl <= 0) {
          initializeState.errorCode = 403
          initializeState.status = 'Expired'
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
    await step(`[${stepNum++}] Try create workspace`, () => {
      const queryEntryPathPattern = /^\/ws\/?$/
      const isFromQueryEntryPath = queryEntryPathPattern.test(urlPath)
      if (isFromQueryEntryPath) {
        // const qsParsed = qs.parse(location.search.substring(1))
        config.openFile = qsParsed.openFile
        const options = {
          ownerName: qsParsed.ownerName,
          projectName: qsParsed.projectName,
          host: qsParsed.host,
        }
        if (qsParsed.envId) options.envId = qsParsed.envId
        if (qsParsed.isTry) {
          options.try = true
        } else {
          options.cpuLimit = 1
          options.memory = 128
          options.storage = 1
        }
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
      api.getUserProfile().then((res) => {
        const data = res.data
        if (data) {
          config.globalKey = data.global_key
          if (!/^(http|https):\/\/[^ "]+$/.test(data.avatar)) {
            data.avatar = `https://coding.net${data.avatar}`
          }
          config.userProfile = data
        }
        return true
      })
    )
  }
  await step(`[${stepNum++}] Expose essential APIs into window object`, () => {
    window.CodingSDK = CodingSDK
    window.store = store
    window.React = React
    window.i18n = i18n
    window.extension = f => null
    window.refs = {}
    window.config = config
    return true
  })
  await step(`[${stepNum++}] load required packages`, () => {
    dispatch(preloadRequirePackages())
    return true
  })
  /* @TODO: websocket connection is not a must, shouldn't block
   * also, terminal connection is optional, only connect when terminal panel is shown
   * */
  await step(`[${stepNum++}] Connect websocket`, () =>
    api.connectWebsocketClient()
  )

  if (config.packageDev) {
    await step(`[${stepNum++}] enable package server hotreload`, () => {
      api.enablePackageHotReload()
      return true
    })
  }


  return step
}

export default initialize
