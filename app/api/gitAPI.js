/* @flow weak */
import { request } from '../utils'
import config from '../config'

export function gitStatus () {
  return request.get(`/git/${config.spaceKey}`)
}

export function gitGetBranches () {
  return request.get(`/git/${config.spaceKey}/branches`)
}

export function gitTags () {
  return request.get(`/git/${config.spaceKey}/tags`)
}

export function gitNewBranch (branchName) {
  return request.post(`/git/${config.spaceKey}/branches`, {branchName})
}

export function gitCheckout (branch, remoteBranch) {
  return request.post(`/git/${config.spaceKey}/checkout`, {
    name: branch, startPoint: remoteBranch
  })
}

export function gitCommit ({files, message}) {
  return request.post(`/git/${config.spaceKey}`, {files, message})
}

export function gitPull () {
  return request.post(`/git/${config.spaceKey}/pull`)
}

export function gitPushAll () {
  return request.post(`/git/${config.spaceKey}/push?all=true`).then(res => {
    if (res.ok || res.nothingToPush) return true
    if (!res.ok) return false
  })
}

export function gitCurrentBranch (){
  return request.get(`/git/${config.spaceKey}/branch`)
}

export function gitCreateStash (message){
  return request.post(`/git/${config.spaceKey}/stash`, {message: message})
}

export function gitStashList (){
  return request.get(`/git/${config.spaceKey}/stash`)
}

export function gitDropStash (stashRef, all=false){
  return request.delete(`/git/${config.spaceKey}/stash`, {stashRef, all})
}

export function gitApplyStash ({stashRef, pop, applyIndex}){
  return request.post(`/git/${config.spaceKey}/stash/apply`, {stashRef, pop, applyIndex})
}

export function gitCheckoutStash ({stashRef, branch}){
  return request.post(`/git/${config.spaceKey}/stash/checkout`, {stashRef, branch})
}

export function gitResetHead ({ref, resetType}) {
  return request.post(`/git/${config.spaceKey}/reset`, {ref, resetType})
}

export function gitConflicts ({path}) {
  return request.get(`/git/${config.spaceKey}/conflicts`, {path, base64:false})
}

export function gitResolveConflict ({path, content}) {
  return request.post(`/git/${config.spaceKey}/conflicts`, {path, content})
}

export function gitRebase ({branch, upstream, interactive, preserve}) {
  return request.post(`/git/${config.spaceKey}/rebase`, {branch, upstream, interactive, preserve})
}

export function gitAddTag ({tagName, ref, message, force}) {
  return request.post(`/git/${config.spaceKey}/tags`, {tagName, ref, message, force})
}

export function gitMerge (branch) {
  return request.post(`/git/${config.spaceKey}/merge`, {name: branch})
}

export function gitRebaseState () {
  return request.get(`/git/${config.spaceKey}?state`)
}

export function gitRebaseOperate ({operation, message}) {
  return request.post(`/git/${config.spaceKey}/rebase/operate`, {operation, message})
}

export function gitRebaseUpdate (lines) {
  return request.postJSON(`/git/${config.spaceKey}/rebase/update`, lines)
}