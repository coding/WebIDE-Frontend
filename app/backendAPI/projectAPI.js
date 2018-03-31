import { request } from '../utils'
import config from '../config'

export function fetchProjects () {
  return request.get('/projects')
}

// export function fetchTemplates () {
//   return request.get('/projects?template=true')
// }

export function fetchTemplates () {
  return request.get('/api/templates', null, { headers: { Accept: 'application/hal+json' } })
}

export function fetchLibraries () {
  return request.get('/api/libraries', null, { headers: { Accept: 'application/hal+json' } })
}

export function findCodingProject ({ projectName }) {
  return request.get(`ws/find/coding/${config.globalKey}/${projectName}`, null, { headers: { Accept: '*/*' } })
}

export function findExternalProject ({ url }) {
  return request.get(`ws/find/coding/${config.globalKey}`, { url })
}

// export function fetchTemplates () {
  // return request.get('/templates', null, { headers: { Accept: '*/*' }})
// }

export function createProject (options) {
  return request.post('/projects', options, { headers: { Accept: '*/*' } });
}