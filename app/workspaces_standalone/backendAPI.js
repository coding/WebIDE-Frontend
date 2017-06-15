import { request } from '../utils'

export function getWorkspaces () {
  return request.get('/workspaces')
}

export function createWorkspace (url) {
  return request.post('/workspaces', { url })
}

export function deleteWorkspace (spaceKey) {
  return request.delete(`/workspaces/${spaceKey}`)
}

export function getPublicKey () {
  return request.get('/user?public_key')
}
