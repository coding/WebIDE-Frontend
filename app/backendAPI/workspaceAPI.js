import config from '../config'
import { request } from '../utils'
import { FsSocketClient, TtySocketClient } from './websocketClients'

let connectedResolve
export const fsSocketConnectedPromise = new Promise((rs, rj) => connectedResolve = rs)

export function isWorkspaceExist () {
  return request.get(`/workspaces/${config.spaceKey}`)
  .catch(() => false)
  .then(data => data)
}

export function setupWorkspace () {
  return request.post(`/workspaces/${config.spaceKey}/setup`)
}

export function createWorkspace (options) {
  return request.post('/workspaces', options)
}

export function findSpaceKey ({ ownerName, projectName }) {
  return request.get(`/ws/find/coding/${ownerName}/${projectName}`, null,
    { headers: { Accept: '*/*' } }
  ).then(res => res.data)
}

export function getWorkspace (spaceKey = config.spaceKey) {
  return request.get(`/workspaces/${spaceKey}`)
}

export function connectWebsocketClient () {
  return new Promise((resolve) => {
    const fsSocketClient = new FsSocketClient()
    fsSocketClient.successCallback = function (stompClient) {
      connectedResolve(stompClient)
      resolve(true)
    }
    fsSocketClient.errorCallback = function (err) {}
    fsSocketClient.connect()
  })
}

export function closeWebsocketClient () {
  const fsSocketClient = new FsSocketClient()
  fsSocketClient.close()
}

export function closeTtySocketClient () {
  const ttySocketClient = new TtySocketClient()
  ttySocketClient.close()
}

export function getSettings () {
  return request.get(`/workspaces/${config.spaceKey}/settings?base64=false`).then(({ content = {} }) => JSON.parse(content))
}

export function triggerCloneTask () {
  return request.post(`/workspaces/${config.spaceKey}/clone`)
}

export function requestCollaborator () {
  return request.post(`/workspaces/${config.spaceKey}/collaborator/request`)
}

export function execShellCommand (command) {
  return request.post(`/tty/${config.spaceKey}/exec`, { command })
}

export function getWorkspaceList () {
  return request.get('/workspaces?page=0&size=5&sort=lastModifiedDate,desc')
}

export function createProject (options) {
  return request.post('/projects', options, { headers: { Accept: '*/*' } })
}
