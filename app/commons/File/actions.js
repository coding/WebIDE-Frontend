import flattenDeep from 'lodash/flattenDeep'
import { registerAction } from 'utils/actions'
import settings from 'settings'
import is from 'utils/is'
import { capitalize } from 'lodash'
import { action, when } from 'mobx'
import api from 'backendAPI'
import config from 'config'
import { showModal } from 'components/Modal/actions'
import { fetchLanguageServerSetting } from 'backendAPI/languageServerAPI'
import { findLanguagesByFileList } from 'components/MonacoEditor/utils/findLanguage'
import state, { FileNode } from './state'

export function fetchPath (path) {
  return api.fetchPath(path).then(nodePropsList =>
    Promise.all(
      nodePropsList.map((nodeProps) => {
        if (nodeProps.isDir && nodeProps.directoriesCount === 1 && nodeProps.filesCount === 0) {
          return fetchPath(nodeProps.path).then(data => [nodeProps].concat(data))
        }
        return Promise.resolve(nodeProps)
      })
    ).then(flattenDeep)
  )
}

export const loadNodeData = registerAction('fs:load_node_data', (nodePropsList) => {
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
})

function tryIdentificationWorkSpaceType (files) {
  return new Promise(async (resolve, _) => {
    const types = findLanguagesByFileList(files)
      .map(type => ({ srcPath: '/', type }))
    if (!types || types.length === 0) {
      Promise.all(
        files.filter(file => file.isDir)
          .map(async (task) => {
            const result = await api.fetchPath(task.path)
            const subTypes = findLanguagesByFileList(result)
              .map(type => ({ srcPath: task.path, type }))
            return Promise.resolve(subTypes)
          })
      )
      .then((langSettings) => {
        resolve(flattenDeep(langSettings.filter(type => type.length > 0)))
      })
    } else {
      resolve(types)
    }
  })
}

const setLanguageSetting = (data) => {
  if (data.length > 1) {
    showModal({ type: 'ProjectTypeSelector', position: 'center', data })
  } else if (data.length === 1) {
    const { type, srcPath } = data[0]
    config.mainLanguage = capitalize(type)
    settings.languageserver.projectType.value = capitalize(type)
    settings.languageserver.sourcePath.value = srcPath
  }
}

const fetchPackageJsonFile = () => {
  api.readFile('/package.json')
    .then(res => {
      const content = JSON.parse(res.content)
      if (content && content.codingIdePackage && content.codingIdePackage.type === 'plugin') {
        config.__PLUGIN_DEV__ = true
      }
    })
}

export const fetchProjectRoot = registerAction('fs:init', () =>
  fetchPath('/').then((data) => {
    /**
     * 插件工作空间判断
     */
    if (data.find(file => file.path === '/package.json')) {
      fetchPackageJsonFile()
    }
    fetchLanguageServerSetting(config.spaceKey).then((res) => {
      if (res.code === 0 && res.data) {
        setLanguageSetting([res.data.default])
      } else {
        tryIdentificationWorkSpaceType(data)
          .then(setLanguageSetting)
      }
    })
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
  if (!!fileNode && !fileNode.isDir) {
    return api
      .readFile(path, encoding)
      .then(loadNodeData)
      .then(files => files[0])
  }
})
