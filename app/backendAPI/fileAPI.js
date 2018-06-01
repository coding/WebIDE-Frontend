import { request, qs } from '../utils'
import axios from 'axios'
import * as maskActions from 'components/Mask/actions'

export function fetchPath (path, order, group) {
  return request.get(`/workspaces/${config.spaceKey}/files`, {
    path,
    order: true,
    group: true
  }).then((res) => {
    return res.filter((item) => {
      return !item.name.startsWith('.nfs000')
    })
  })
}

export function downloadFile (path, shouldPacked) {
  let filePath = path || config.projectName || 'Home'
  if (shouldPacked) {
    filePath += '.tar.gz'
  }
  // if (config.isDefault) {
  //   filePath = 'Home.tar.gz'
  // }
  const packOrRaw = shouldPacked ? 'pack' : 'raw'
  let url = `${config.baseURL}/workspaces/${config.spaceKey}/${packOrRaw}`
  url += `?${qs.stringify({
    path,
    inline: false
  })}`
  // window.open(url, '_blank')
  const downloadTimeout = setTimeout(() => {
    maskActions.showMask({ message: i18n`file.preparingDownload`, countdown: 60 })
  }, 600)
  request.download(url, filePath.split('/').pop()).then((res) => {
    clearTimeout(downloadTimeout)
    maskActions.hideMask()
  })
}

export function uploadFile (path, file, option) {
  const formdata = new FormData()
  formdata.append('path', path)
  formdata.append('files', file, file.name)
  request.upload(`${config.baseURL}/workspaces/${config.spaceKey}/upload`, formdata, {
    onUploadProgress: option.onUploadProgress
  }).catch((res) => {
    option.onUploadFailed()
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

export function readFile (path, encoding) {
  const url = config.isPlatform ?
    `/workspaces/${config.spaceKey}/read`
  : `/workspaces/${config.spaceKey}/file/read`

  return request.get(url, {
    path,
    base64: false,
    encoding
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
