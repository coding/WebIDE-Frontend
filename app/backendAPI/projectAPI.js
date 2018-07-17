import { request } from '../utils'
import config from '../config'

export function fetchProjects () {
  return request.get('/projects')
}

export function fetchTemplates () {
  return request.get('/projects?template=true')
}

export function findCodingProject ({ projectName, ownerName }) {
  return request.get(`ws/find/coding/${ownerName}/${projectName}`, null, { headers: { Accept: '*/*' } })
}

export function findExternalProject ({ url }) {
  return request.get(`ws/find/coding/${config.globalKey}`, { url })
}

export function syncProject () {
  return request.post('/project/sync')
}

export function queryCodingProject ({ source = 'coding', projectName }) {
  return request.get(`/queryCodingProject`, { source, projectName })
}

export function showPublicSshKey () {
  return request.get('user/public_key', null, { headers: { Accept: 'application/vnd.coding.v1+json' } });
}

export function createProject (options) {
  return request.post('/projects', options, { headers: { Accept: '*/*' } });
}
