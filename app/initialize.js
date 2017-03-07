import React from 'react'
import qs from 'query-string'
import config from './config'
import api from './backendAPI'
import { stepFactory, createI18n, getExtensions, request } from './utils'

async function initialize () {
  const step = stepFactory()

  await step('[0] Get spaceKey from window.location', () => {
    const { spaceKey } = qs.parse(window.location.hash.slice(1))
    if (spaceKey) config.spaceKey = spaceKey
    return Boolean(spaceKey)
  })

  await step('[1] Check if workspace exist', () =>
    api.isWorkspaceExist()
  )

  await step('[2] Setting up workspace...', () =>
    api.setupWorkspace().then(res => {
      Object.assign(config, res)
      if (config.project && config.project.name)
        config.projectName = config.project.name
      return true
    })
  )

  if (!config.isPlatform) await step('[3] Get workspace settings', () =>
    api.getSettings().then(settings => config.settings = settings)
  )

  await step('[4] Connect websocket', () =>
    api.connectWebsocketClient()
  )

  await step('[5] Expose essential APIs into window object', () => {
    window.React = React
    window.i18n = createI18n
    window.extensions = {}
    window.extension = f => getExtensions
    window.request = request
    window.config = config
    window.refs = {}
  })
}

export default initialize
