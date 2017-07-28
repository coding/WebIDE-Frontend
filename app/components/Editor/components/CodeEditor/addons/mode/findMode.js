// CodeMirror, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
import modeInfos from './modeInfos'

const defaultModeInfo = modeInfos.find(info => info.mode === 'null')

export function findModeByMIME (mime) {
  mime = mime.toLowerCase()
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
    if (info.mime === mime) return info
    if (info.mimes) {
      for (let j = 0; j < info.mimes.length; j++) {
        if (info.mimes[j] === mime) return info
      }
    }
  }
  if (/\+xml$/.test(mime)) return findModeByMIME('application/xml')
  if (/\+json$/.test(mime)) return findModeByMIME('application/json')
  return null
}

export function findModeByExtension (ext) {
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
    if (info.ext) {
      for (let j = 0; j < info.ext.length; j++) {
        if (info.ext[j] === ext) return info
      }
    }
  }
  return null
}

export function findModeByFileName (filename) {
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
    if (info.file && info.file.test(filename)) return info
  }
  const dot = filename.lastIndexOf('.')
  const ext = dot > -1 && filename.substring(dot + 1, filename.length)
  if (ext) return findModeByExtension(ext)
  return null
}

export function findModeByName (name) {
  name = name.toLowerCase()
  for (let i = 0; i < modeInfos.length; i++) {
    const info = modeInfos[i]
    if (info.name.toLowerCase() === name) return info
    if (info.alias) {
      for (let j = 0; j < info.alias.length; j++) {
        if (info.alias[j].toLowerCase() === name) return info
      }
    }
  }
  return null
}

export default function findModeByFile (file = {}) {
  const info = (
    file.contentType && findModeByMIME(file.contentType)
  ) || (
    file.path && findModeByFileName(file.path)
  )
  return info || defaultModeInfo
}
