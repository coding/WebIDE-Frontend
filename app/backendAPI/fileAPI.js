import { request, qs } from '../utils'
import config from '../config'
import axios from 'axios'

export function fetchPath (path, order, group) {
  return request.get(`/workspaces/${config.spaceKey}/files`, {
    path,
    order: true,
    group: true
  })
}

export function downloadFile (path, shouldPacked) {
  const packOrRaw = shouldPacked ? 'pack' : 'raw'
  let url = `${config.baseURL}/workspaces/${config.spaceKey}/${packOrRaw}`
  url += `?${qs.stringify({
    path,
    inline: false
  })}`
  window.open(url, '_blank')
}

export function uploadFile (path, file, option) {
  const formdata = new FormData()
  formdata.append('path', path)
  formdata.append('files', file, file.name)
  request.upload(`${config.baseURL}/workspaces/${config.spaceKey}/upload`, formdata, {
    onUploadProgress: option.onUploadProgress
  })
}


export function writeFile (path, content, base64) {
  return request({
    method: 'PUT',
    url: `/workspaces/${config.spaceKey}/files`,
    data: {
      path,
      content,
      base64: base64 || false,
      override: true,
      createParent: true
    }
  })
}

export function readFile (path) {
  const url = config.isPlatform ?
    `/workspaces/${config.spaceKey}/read`
  : `/workspaces/${config.spaceKey}/file/read`

  return request.get(url, {
    path,
    base64: false
  })
}

export function createFile (path) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/files`,
    data: {
      path
    }
  })
}

export function createFolder (path) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/mkdir`,
    data: {
      path
    }
  })
}

export function moveFile (from, to, force = false) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/move`,
    data: {
      from,
      to,
      force
    }
  })
}

export function deleteFile (path) {
  return request({
    method: 'DELETE',
    url: `/workspaces/${config.spaceKey}/files`,
    params: {
      path,
      recursive: true
    }
  })
}

export function searchFile (value, includeNonProjectItems = false) {
  return request({
    method: 'POST',
    url: `/workspaces/${config.spaceKey}/search`,
    data: {
      keyword: value,
      includeNonProjectItems
    }
  })
}
