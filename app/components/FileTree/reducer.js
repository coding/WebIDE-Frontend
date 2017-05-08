import _ from 'lodash'
import { autorun, extendObservable } from 'mobx'
import { handleActions } from 'utils/actions'
import config from 'config'
import state, { Node } from './state'
import {
  loadNodeData,
  toggleNodeFold,
  selectNode,
  highlightDirNode,
  removeNode,
  openContextMenu,
  closeContextMenu,
} from './actions'

const ROOT_PATH = ''

handleActions({
  [loadNodeData]: (state, payload) => {
    payload.forEach(nodeInfo => {
      let nextNodeInfo = { ...nodeInfo, path: ROOT_PATH + nodeInfo.path }
      const curNodeInfo = state.nodes.get(nextNodeInfo.path)
      if (curNodeInfo) nextNodeInfo = {...curNodeInfo, ...nextNodeInfo}
      state.nodes.set(nextNodeInfo.path, new Node(nextNodeInfo))
    })
  },

  [selectNode]: (state, payload) => {
    const { node: nodeOrOffset, multiSelect } = payload
    let offset, node
    if (typeof nodeOrOffset === 'number') {
      offset = nodeOrOffset
    } else {
      node = nodeOrOffset
    }

    if (offset === 1) {
      node = state.focusedNodes[0].next(true)
    } else if (offset === -1) {
      node = state.focusedNodes[0].prev(true)
    }

    if (!multiSelect) {
      state.root.unfocus()
      state.root.forEachDescendant(childNode => childNode.unfocus())
    }

    node.focus()
  },

  [highlightDirNode]: (state, payload) => {
    node = payload
    if (node.isDir) node.highlight()
  },

  [toggleNodeFold]: (state, payload) => {
    let { node, shouldBeFolded, deep } = payload
    if (!node.isDir) return state
    let isFolded
    if (typeof shouldBeFolded === 'boolean') {
      isFolded = shouldBeFolded
    } else {
      isFolded = !node.isFolded
    }
    node.toggleFold(isFolded)
    if (deep) {
      node.forEachDescendant(childNode => {
        childNode.toggleFold(isFolded)
      })
    }
  },

  [removeNode]: (state, payload) => {
    let node = payload
    state.nodes.delete(node.path)
  },

  [openContextMenu]: (state, payload) => {
    extendObservable(state.contextMenuState, payload)
  },

  [closeContextMenu]: (state, payload) => {
    state.contextMenuState.isActive = false
  },
}, state)


let reduxState
autorun(() => {
  reduxState = state.toJS()
})

function reducer (prevState, action) {
  return reduxState
}

export default reducer
