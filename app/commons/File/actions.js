import { registerAction } from 'utils/actions'
import { action } from 'mobx'
import api from 'backendAPI'
import state, { FileNode } from './state'

export const loadNodeData = registerAction('fs:load_node_data',
  (nodeConfigs) => {
    return nodeConfigs.map(nodeConfig => {
      const curNode = state.entities.get(nodeConfig.path)
      if (curNode) {
        curNode.update(nodeConfig)
        return curNode
      }
      const newNode = new FileNode(nodeConfig)
      state.entities.set(newNode.path, newNode)
      return newNode
    })

  }
)

export const fetchProjectRoot = registerAction('fs:init', () =>
  api.fetchPath('/').then(loadNodeData)
)

export const removeNode = registerAction('fs:remove_node', (node) => {
  state.entities.delete(node.id)
})
