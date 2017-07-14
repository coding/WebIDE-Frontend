import { request, qs } from '../utils'
import config from '../config'

export function fetchCollaborators (status) {
  return request.get(`/workspaces/${config.spaceKey}/collaborators`, { status })
}

export function postCollaborators (inviteKey) {
  return request.post(`/workspaces/${config.spaceKey}/collaborators`, {
    inviteKey
  })
}

export function deleteCollaborators (globalKey) {
  return request.delete(`/workspaces/${config.spaceKey}/collaborators/${globalKey}`)
}
