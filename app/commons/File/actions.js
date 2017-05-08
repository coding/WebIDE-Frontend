import { registerAction } from 'utils/actions'
import { action } from 'mobx'
import api from 'backendAPI'
import state from './state'

export const loadNodeData = registerAction('fs:load_node_data',
  (nodeConfigs) => {
    return nodeConfigs.map(nodeConfig => {
      const curNode = state.nodes.get(nodeConfig.path)
      if (curNode) {
        curNode.update(nodeConfig)
        return curNode
      }
      const newNode = new Node(nodeConfig)
      state.nodes.set(newNode.path, newNode)
      return newNode
    })

  }
)

export const fetchProjectRoot = registerAction('fs:init', () =>
  api.fetchPath('/').then(loadNodeData)
)

// export { loadNodeData, fetchProjectRoot }
