import qs from 'query-string'
import config from './config'
import api from './backendAPI'
import { stepFactory } from './utils'

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
    api.setupWorkspace2().then(({ projectName, projectIconUrl }) => {
      config.projectName = projectName
      config.projectIconUrl = projectIconUrl
      return true
    })
  )

  await step('[3] Get workspace settings', () =>
    api.getSettings().then(settings => config.settings = settings)
  )

  await step('[4] Connect websocket', () =>
    api.connectWebsocketClient()
  )
}

export default initialize
