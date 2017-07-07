import config from '../config'
import { request } from '../utils'
import { FsSocketClient } from './websocketClients'

let connectedResolve
export const fsSocketConnectedPromise = new Promise((rs, rj) => connectedResolve = rs)

export function isWorkspaceExist () {
  return request.get(`/workspaces/${config.spaceKey}`).catch(() => false).then(() => true)
}

export function setupWorkspace () {
  return config.isPlatform ?
    request.post('/workspaces', { spaceKey: config.spaceKey })
  : request.post(`/workspaces/${config.spaceKey}/setup`)
}

export function createWorkspace (options) {
  return request.post('/workspaces', options)
}

export function connectWebsocketClient () {
  return new Promise((resolve, reject) => {
    const fsSocketClient = new FsSocketClient()
    fsSocketClient.connect(function () {
      connectedResolve(this)
      resolve(true)
    }, (err) => {
    })
  })
}

export function getSettings () {
  return request.get(`/workspaces/${config.spaceKey}/settings`).then(({ content = {} }) => JSON.parse(content))
}

// Switch back to old version
export function switchVersion () {
  return request.put('/versions')
  .then((res) => {
    window.location.reload()
  })
}

export function getUserProfile () {
  // @fixme: platform v1 api
  // return request.get('/user/current').then(res => res.data)
  return request.get('/user/current', null,
    { headers: { Accept: '*/*' } }
  ).then(res => res.data)
}

export function findSpaceKey ({ ownerName, projectName }) {
  return request.get(`/ws/find/coding/${ownerName}/${projectName}`, null,
    { headers: { Accept: '*/*' } }
  ).then(res => res.data)
}

import OTSubscription from './OTSubscription'
