/* @flow weak */
import config from '../config'
import { request } from '../utils'
import Client from './websocketClient'

var connectedResolve
export const websocketConnectedPromise = new Promise((rs, rj) => connectedResolve = rs)
export function setupWorkspace () {
  return request.post(`/workspaces/${config.spaceKey}/setup`).then(({spaceKey, projectName, projectIconUrl}) => {
    // 1.
    var websocketPromise = new Promise(function (resolve, reject) {
      Client.connect(function () {
        connectedResolve(this)
        resolve(true)
      })
    })

    // 2.
    var settingsPromise = request.get(`/workspaces/${config.spaceKey}/settings`).then(({content}) => {
      return JSON.parse(content)
    })

    return Promise.all([websocketPromise, settingsPromise]).then(([isConnected, settings]) => {
      return {
        projectName,
        spaceKey,
        projectIconUrl,
        settings
      }
    })
  })
}


export function isWorkspaceExist () {
  return request.get(`/workspaces/${config.spaceKey}`).catch(() => false).then(() => true)
}


export function setupWorkspace2 () {
  return request.post(`/workspaces/${config.spaceKey}/setup`)
}

export function connectWebsocketClient () {
  return new Promise(function (resolve, reject) {
    Client.connect(function () {
      connectedResolve(this)
      resolve(true)
    })
  })
}

export function getSettings () {
  return request.get(`/workspaces/${config.spaceKey}/settings`).then(({ content={} }) => {
    return JSON.parse(content)
  })
}
