import flattenDeep from 'lodash/flattenDeep'
import { registerAction } from 'utils/actions'
import settings from 'settings'
import is from 'utils/is'
import { action, when } from 'mobx'
import api from 'backendAPI'
import config from 'config'
import { findLanguageByFileName } from 'components/MonacoEditor/utils/findLanguage'
import state, { FileNode } from './state'

export function fetchPath (path) {
  return api.fetchPath(path).then(nodePropsList => Promise.all(nodePropsList.map((nodeProps) => {
    if (nodeProps.isDir && nodeProps.directoriesCount === 1 && nodeProps.filesCount === 0) {
      return fetchPath(nodeProps.path).then(data => [nodeProps].concat(data))
    }
    return Promise.resolve(nodeProps)
  })).then(flattenDeep))
}

export const loadNodeData = registerAction('fs:load_node_data',
  (nodePropsList) => {
    if (!is.array(nodePropsList)) nodePropsList = [nodePropsList]
    return nodePropsList.map((nodeProps) => {
      const curNode = state.entities.get(nodeProps.path)
      if (curNode) {
        const curNodeTime = new Date(curNode.lastModified)
        const newNodeTime = new Date(nodeProps.lastModified)
        if (newNodeTime.getTime() > curNodeTime.getTime() || !curNodeTime.content) {
          curNode.update(nodeProps)
        }
        return curNode
      }
      const newNode = new FileNode(nodeProps)
      state.entities.set(newNode.path, newNode)
      return newNode
    })
  }
)

export const fetchProjectRoot = registerAction('fs:init', () =>
  fetchPath('/').then((data) => {
    const mainLanguage = findLanguageByFileName(data)
    if ((!config.mainLanguage || config.mainLanguage !== '') && mainLanguage !== '') {
      config.mainLanguage = mainLanguage
      settings.languageserver.projectType.value = mainLanguage
    }
    return loadNodeData(data)
  })
)

export const removeNode = registerAction('fs:remove_node', (node) => {
  const nodePath = node.path
  const fileNode = state.entities.get(nodePath)
  if (fileNode) {
    if (fileNode.isDir) {
      const nodesToKeep = state.entities.entries().filter(([nPath]) => !nPath.startsWith(nodePath))
      state.entities.replace(nodesToKeep)
    } else {
      state.entities.delete(nodePath)
    }
  }
})

export const updateFile = registerAction('fs:update', (fileProps) => {
  const path = fileProps.id || fileProps.path
  const file = state.entities.get(path)
  file.update(fileProps)
})

export const syncFile = registerAction('fs:sync', (params) => {
  let path, encoding
  if (is.string(params)) {
    path = params
  } else {
    path = params.path
    encoding = params.encoding
  }
  const fileNode = state.entities.get(path)
  if (!fileNode.isDir) return api.readFile(path, encoding).then(loadNodeData).then(files => files[0])
})
