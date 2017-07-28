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

export function deleteCollaborators (id) {
  return request.delete(`/workspaces/${config.spaceKey}/collaborators/${id}`)
}

export function requestCollaborator () {
  return request.post(`/workspaces/${config.spaceKey}/collaborator/request`)
}

export function fetchRqeuestState () {
  return request.get(`/workspaces/${config.spaceKey}/collaborator/request`)
}

export function rejectCollaborator (id) {
  return request.post(`/workspaces/${config.spaceKey}/collaborators/${id}/reject`)
}
