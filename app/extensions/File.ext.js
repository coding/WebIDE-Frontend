import dispatchCommand from 'commands/dispatchCommand'
import FileState, { extState } from 'commons/File/state'
import * as fileApi from 'backendAPI/fileAPI'
import { fileIconProviders } from 'components/FileTree/state'
import { fileIconOptions } from 'settings'
import { findLanguageByextensions } from 'components/MonacoEditor/utils/findLanguage'

export function openCreateFileModal () {
  dispatchCommand('file:new_file')
}

export function getFileNode (filePath) {
  return FileState.entities.get(filePath)
}

export function getFileContent (filePath) {
  return new Promise((resolve, reject) => {
    fileApi.readFile(filePath)
      .then((data) => resolve(data.content))
      .catch(reject)
  })
}

function removeFileDidOpenListener (fn) {
  extState.didOpenListeners = extState.didOpenListeners.filter(f => f !== fn)
}

export function onDidFileOpen (fn) {
  extState.didOpenListeners.push(fn)
  return () => {
    removeFileDidOpenListener(fn)
  }
}

export function removeFileNodeCreatedListener (fn) {
  extState.createdListeners = extState.createdListeners.filter(f => f !== fn)
}

export function onDidFileNodeCreated (fn) {
  extState.createdListeners.push(fn)
  return () => {
    removeFileNodeCreatedListener(fn)
  }
}

export function registerFileIconProvider (name, provider) {
  fileIconProviders.set(name, provider)
  if (!fileIconOptions.includes(name)) {
    fileIconOptions.push(name)
  }
}

export function findLanguageByextension (ext) {
  return findLanguageByextensions(ext)
}
