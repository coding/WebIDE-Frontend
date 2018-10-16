import dispatchCommand from 'commands/dispatchCommand'
import FileState from 'commons/file/state'
import * as fileApi from 'backendAPI/fileAPI'

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
