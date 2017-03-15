import _ from 'lodash'
import { handleActions } from 'redux-actions'
import config from '../../config'
import { update } from '../../utils'
import {
  loadNodeData,
  toggleNodeFold,
  selectNode,
  highlightDirNode,
  removeNode,
  openContextMenu,
  closeContextMenu,
  ROOT_PATH,
} from './actions'

// the @action decorator is just a hint to denote where the actual mutation happens
// whereas @computed denotes where it's a getter that has no side effect
// these syntaxes are taken from mobx
function action () { return f => f }
function computed () { return f => f }

class Node {
  static nodes = {};
  static get root () { return Node.nodes[ROOT_PATH] }

  constructor (nodeInfo) {
    const {
      name,
      path,
      isDir,
      gitStatus,
      isFolded,
      isFocused,
      isHighlighted,
    } = nodeInfo

    this.name = name
    this.path = path
    this.isDir = isDir
    this.gitStatus = gitStatus
    this.isFolded = _.isBoolean(isFolded) ? isFolded : true
    this.isFocused = _.isBoolean(isFocused) ? isFocused : false
    this.isHighlighted = _.isBoolean(isHighlighted) ? isHighlighted : false
  }

  // this is solely for triggering re-render of a redux-connected component
  // with mobx this won't be necessary
  reconstruct () {
    Node.nodes[this.path] = new Node(this)
  }

  @computed
  get isRoot () {
    return this.path === ROOT_PATH
  }

  @computed
  get depth () {
    var slashMatches = this.path.match(/\/(?=.)/g)
    return slashMatches ? slashMatches.length : 0
  }

  @computed
  get parent () {
    const pathComps = this.path.split('/')
    pathComps.pop()
    const parentPath = pathComps.join('/')
    return Node.nodes[parentPath]
  }

  @computed
  get children () {
    const depth = this.depth
    return Object.values(Node.nodes)
      .filter(node => node.path.startsWith(`${this.path}/`) && node.depth === depth + 1)
  }

  @computed
  get siblings () {
    return this.parent.children
  }

  @computed
  get firstChild () {
    return this.children[0]
  }

  @computed
  get lastChild () {
    return this.children.pop()
  }

  @computed
  get lastVisibleDescendant () {
    var lastChild = this.lastChild
    if (!lastChild) return this
    if (!lastChild.isDir) return lastChild
    if (lastChild.isFolded) return lastChild
    return lastChild.lastVisibleDescendant
  }

  prev (jump) {
    if (this.isRoot) return this

    const siblings = this.siblings
    const prevNode = siblings[siblings.indexOf(this) - 1]

    if (prevNode) {
      if (!jump) return prevNode
      if (!prevNode.isDir || prevNode.isFolded) return prevNode
      if (prevNode.lastChild) {
        return prevNode.lastVisibleDescendant
      } else {
        return prevNode
      }
    } else {
      return this.parent
    }
  }

  next (jump) {
    if (jump && this.isDir && !this.isFolded) {
      if (this.firstChild) return this.firstChild
    } else if (this.isRoot) {
      return this
    }

    const siblings = this.siblings
    const nextNode = siblings[siblings.indexOf(this) + 1]

    if (nextNode) {
      return nextNode
    } else {
      if (this.parent.isRoot) return this
      return this.parent.next()
    }
  }

  @action
  forEachDescendant (handler) {
    if (!this.isDir) return
    this.children.forEach(childNode => {
      handler(childNode)
      childNode.forEachDescendant(handler)
    })
  }

  @action
  focus () {
    if (this.isFocused) return
    this.isFocused = true
    this.reconstruct()
  }

  @action
  unfocus () {
    if (!this.isFocused) return
    this.isFocused = false
    this.reconstruct()
  }

  @action
  fold () {
    if (!this.isDir || this.isFolded) return
    this.isFolded = true
    this.reconstruct()
  }

  @action
  unfold () {
    if (!this.isDir || !this.isFolded) return
    this.isFolded = false
    this.reconstruct()
  }

  @action
  toggleFold (shouldBeFolded) {
    if (shouldBeFolded) {
      this.fold()
    } else {
      this.unfold()
    }
  }

  @action
  highlight () {
    if (!this.isDir || this.isHighlighted) return
    this.isHighlighted = true
    this.reconstruct()
  }

  @action
  unhighlight () {
    if (!this.isDir || !this.isHighlighted) return
    this.isHighlighted = false
    this.reconstruct()
  }
}

const bootstrapRootNode = () => {
  Node.nodes[ROOT_PATH] = new Node({
    path: ROOT_PATH,
    name: config.projectName,
    isDir: true,
    isFolded: false,
  })
}

const initialState = {
  nodes: Node.nodes,
  contextMenuState: {
    isActive: false,
    pos: { x: 0, y: 0 },
    contextNode: null,
  }
}

const focusedNodes = () =>
  Object.values(Node.nodes).filter(node => node.isFocused)

export default handleActions({
  [loadNodeData]: (state, action) => {
    if (!Node.nodes[ROOT_PATH]) bootstrapRootNode()
    action.payload.forEach(nodeInfo => {
      let nextNodeInfo = { ...nodeInfo, path: ROOT_PATH + nodeInfo.path }
      const curNodeInfo = Node.nodes[nextNodeInfo.path]
      if (curNodeInfo) nextNodeInfo = {...curNodeInfo, ...nextNodeInfo}
      Node.nodes[nextNodeInfo.path] = new Node(nextNodeInfo)
    })

    Node.root.reconstruct()
    return update(state, {
      nodes: { $merge: Node.nodes }
    })
  },

  [selectNode]: (state, action) => {
    const { node: nodeOrOffset, multiSelect } = action.payload
    let offset, node
    if (typeof nodeOrOffset === 'number') {
      offset = nodeOrOffset
    } else {
      node = nodeOrOffset
    }

    if (offset === 1) {
      node = focusedNodes()[0].next(true)
    } else if (offset === -1) {
      node = focusedNodes()[0].prev(true)
    }

    if (!multiSelect) {
      Node.root.unfocus()
      Node.root.forEachDescendant(childNode => childNode.unfocus())
    }

    node.focus()

    return update(state, {
      nodes: { $merge: Node.nodes }
    })
  },

  [highlightDirNode]: (state, action) => {
    node = action.payload
    if (node.isDir) node.highlight()
    return update(state, {
      nodes: { $merge: Node.nodes }
    })
  },

  [toggleNodeFold]: (state, action) => {
    let { node, shouldBeFolded, deep } = action.payload
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
    return update(state, {
      nodes: { $merge: Node.nodes }
    })
  },

  [removeNode]: (state, action) => {
    let node = action.payload
    delete Node.nodes[node.path]
    return update(state, {
      nodes: { $set: {...Node.nodes} }
    })
  },

  [openContextMenu]: (state, action) => {
    return update(state, {
      contextMenuState: { $set: action.payload }
    })
  },

  [closeContextMenu]: (state, action) => {
    return update(state, {
      contextMenuState: { isActive: { $set: false } }
    })
  },
}, initialState)
