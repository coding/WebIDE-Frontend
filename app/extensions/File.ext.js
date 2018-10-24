import dispatchCommand from 'commands/dispatchCommand'
import FileState from 'commons/File/state'
import * as fileApi from 'backendAPI/fileAPI'
import { fileIconProviders } from 'components/FileTree/state'
import { fileIconOptions } from 'settings'

export function openCreateFileModal () {
  dispatchCommand('file:new_file')
}

export function getFileNode (filePath) {
  return FileState.entities.get(filePath)
}

export function getFileContent (filePath) {
  return fileApi.readFile(filePath)
}

export function removeFileNodeCreatedListener (fn) {
  FileState.createdListeners = FileState.createdListeners.filter(f => f !== fn)
}

export function onDidFileNodeCreated (fn) {
  FileState.createdListeners.push(fn)
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
