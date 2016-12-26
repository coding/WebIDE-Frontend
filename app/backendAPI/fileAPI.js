/* @flow weak */
import { request, querystring as qs } from '../utils'
import config from '../config'

export function fetchPath (path, other, group) {
  return request.get(`/workspaces/${config.spaceKey}/files`, {
    path: path,
    other: true,
    group: true
  })
}

export function downloadFile (path, shouldPacked) {
  const packOrRaw = shouldPacked ? 'pack' : 'raw'
  let url = `${config.baseURL}/workspaces/${config.spaceKey}/${packOrRaw}`
  url += '?' + qs.stringify({
    path: path,
    inline: false
  })
  window.open(url, '_blank')
}

export function uploadFile (path, file) {
  let formdata = new FormData()
  formdata.append('path', path)
  formdata.append('files', file, file.name)
  fetch(`${config.baseURL}/workspaces/${config.spaceKey}/upload`, {
    method: 'POST',
    body: formdata,
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

export function searchFile (value, includeNonProjectItems = false) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/search`,
    form: {
      keyword: value,
      includeNonProjectItems: includeNonProjectItems
    }
  })
}
