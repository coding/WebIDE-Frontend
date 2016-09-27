/* @flow weak */
import request from '../utils/request'
import config from '../config'

export function gitStatus() {
  return request.get(`/git/${config.spaceKey}`)
}

export function gitBranch() {
  return request.get(`/git/${config.spaceKey}/branches`)
}

export function gitCheckout(branch, remoteBranch) {
  return request.post(`/git/${config.spaceKey}/checkout`, {
    name:branch, startPoint:remoteBranch
  })
}

export function gitCommit({files, message}) {
  return request.post(`/git/${config.spaceKey}`, {files, message})
}

export function gitPull() {
  return request.post(`/git/${config.spaceKey}/pull`)
}

export function gitPushAll() {
  return request.post(`/git/${config.spaceKey}/push?all=true`).then(res => {
    if (res.ok || res.nothingToPush) return true
    if (!res.ok) return false
  })
}
