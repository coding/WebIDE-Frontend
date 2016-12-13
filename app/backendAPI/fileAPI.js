/* @flow weak */
import { request } from '../utils'
import config from '../config'

export function fetchPath (path, other, group) {
  return request.get(`/workspaces/${config.spaceKey}/files`, {
    path: path,
    other: true,
    group: true
  })
}

export function writeFile (path, content, base64) {
  return request({
    method: 'PUT',
    url: `/workspaces/${config.spaceKey}/files`,
    form: {
      path: path,
      content: content,
      base64: base64 || false,
      override: true,
      createParent: true
    }
  })
}

export function readFile (path) {
  return request.get(`/workspaces/${config.spaceKey}/file/read`, {
    path: path,
    base64: false
  })
}

export function createFile (path) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/files`,
    form: {
      path: path
    }
  })
}

export function moveFile (from, to, force = false) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/move`,
    form: {
      from: from,
      to: to,
      force: force
    }
  })
}

export function deleteFile (path) {
  return request({
    method: 'DELETE',
    url: `/workspaces/${config.spaceKey}/files`,
    qs: {
      path: path,
      recursive: true
    }
  })
}
