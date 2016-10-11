/* @flow weak */
import _ from 'lodash'
import config from '../../config'

import {
  FILETREE_LOAD_DATA,
  FILETREE_FOLD_NODE,
  FILETREE_SELECT_NODE,
  FILETREE_SELECT_NODE_KEY,
  FILETREE_REMOVE_NODE
} from './actions'


let focusedNodes = []
class Node {
  constructor (nodeInfo) {
    const {
      name, path, isDir, isRoot, shouldBeUpdated,
      directoriesCount, filesCount,
      gitStatus, lastModified, lastAccessed,
      contentType
    } = nodeInfo

    this.name = name
    this.path = path
    this.isDir = isDir
    this.shouldBeUpdated = true || shouldBeUpdated
    this.gitStatus = gitStatus
    this.lastModified = new Date(lastModified)
    this.lastAccessed = new Date(lastAccessed)
    this.contentType = contentType

    this.isFolded = true
    this.isFocused = false
    this.children = []

    if (isDir) {
      this.directoriesCount = directoriesCount
      this.filesCount = filesCount
      this.childrenCount = directoriesCount + filesCount
    }

    if (isRoot) {
      Node.rootNode = this
      this.isRoot = isRoot
      this.isFolded = false
    }
  }

  get depth () {
    var slashMatches = this.path.match(/\/(?=.)/g)
    return slashMatches ? slashMatches.length : 0
  }

  set depth (v) { /* no-op */ }

  focus () {
    this.isFocused = true
    if (focusedNodes.indexOf(this) === -1) focusedNodes.push(this)
  }

  unfocus () {
    this.isFocused = false
    _.remove(focusedNodes, this)
  }

  getSiblings () {
    return this.parent.children
  }

  prev (jump) {
    var siblings = this.getSiblings()
    var curIndex = siblings.indexOf(this)
    var prevNode = siblings[curIndex - 1]

    if (prevNode) {
      if (!jump) return prevNode
      if (!prevNode.isDir || prevNode.isFolded) return prevNode
      if (prevNode.lastChild()) {
        return prevNode.lastVisibleDescendant()
      } else {
        return prevNode
      }
    } else {
      return this.parent
    }
  }

  next (jump) {
    var siblings = this.getSiblings()
    var curIndex = siblings.indexOf(this)
    var nextNode = siblings[curIndex + 1]

    if (jump && this.isDir && !this.isFolded) {
      if (this.firstChild()) return this.firstChild()
    }

    if (nextNode) {
      return nextNode
    } else {
      return this.parent.next()
    }
  }

  firstChild () {
    return this.children[0]
  }

  lastChild () {
    return this.children[this.children.length - 1]
  }

  lastVisibleDescendant () {
    var lastChild = this.children[this.children.length - 1]
    if (!lastChild) return this
    if (!lastChild.isDir) return lastChild
    if (lastChild.isFolded) return lastChild
    return lastChild.lastVisibleDescendant()
  }

  _findChildNodeByPathComponents (pathComponents) {
    var pathComponent = pathComponents[0]
    var childNode = _.filter(this.children, {name: pathComponent})[0]
    var nextPathComponents = pathComponents.slice(1)
    if (nextPathComponents.length === 0) { return childNode }
    return childNode._findChildNodeByPathComponents(nextPathComponents)
  }

  // apply to not only direct children but all descendants
  forEachDescendant (handler) {
    if (!this.isDir) return
    this.children.forEach(childNode => {
      handler(childNode)
      childNode.forEachDescendant(handler)
    })
  }

  applyChangeToNode (nodeInfo, changeType) {
    const pathComponents = nodeInfo.path.split('/') // => ['', 'depth_1', 'depth_2']
    const childNodeName = pathComponents[this.depth + 1]
    var childNode = _.find(this.children, {name: childNodeName})

    if (this.depth + 1 === pathComponents.length - 1) {
      // reach target node!
      switch (changeType) {
        case 'create':
          if (childNode) break
          childNode = new Node(nodeInfo)
          childNode.parent = this
          this.children.push(childNode)
          break
        case 'delete':
          if (!childNode) break
          _.remove(this.children, childNode)
          break
      }
    } else {
      // internal node case,
      // if doesn't exist, init a placeholder node and continue traverse deeper.
      if (!childNode) {
        childNode = new Node({
          isDir: true,
          name: childNodeName,
          path: pathComponents.slice(0, this.depth + 2).join('/')
        })
        childNode.parent = this
        this.children.push(childNode) // @todo: update children-related counts in parentNode
      }

      childNode.applyChangeToNode(nodeInfo, changeType)
    }
  }
}

// =========================

var RootNode = new Node({
  name: config.projectName || '',
  path: '/',
  isDir: true,
  isRoot: true
})

const findNodeByPath = (path) => {
  if (path === '/') return Node.rootNode
  const pathComponents = path.split('/').slice(1)
  return Node.rootNode._findChildNodeByPathComponents(pathComponents)
}

var _state = {}
_state.rootNode = RootNode

const normalizeState = (_state) => {
  var state = {
    findNodeByPath,
    focusedNodes
  }
  state.rootNode = _state.rootNode
  state.rootNode.name = config.projectName
  return state
}

export default function FileTreeReducer (state = _state, action) {
  switch (action.type) {

    case FILETREE_LOAD_DATA:
      var {node, data} = action
      if (!node) node = RootNode
      node.shouldBeUpdated = false
      data.forEach(nodeInfo => node.applyChangeToNode(nodeInfo, 'create'))
      state.rootNode = RootNode
      return normalizeState(state)

    case FILETREE_SELECT_NODE_KEY:
      var curNode = focusedNodes[0]
      var siblings = curNode.parent.children
      var curIndex = siblings.indexOf(curNode)
      var node

      if (action.offset === 1) {
        node = curNode.next(true)
      } else if (action.offset === -1 ) {
        node = curNode.prev(true)
      }

      if (!multiSelect) {
        RootNode.unfocus()
        RootNode.forEachDescendant(childNode => childNode.unfocus())
      }
      node.focus()

      return normalizeState(state)

    case FILETREE_SELECT_NODE:
      var {node, multiSelect} = action

      if (!multiSelect) {
        RootNode.unfocus()
        RootNode.forEachDescendant(childNode => childNode.unfocus())
      }
      node.focus()

      return normalizeState(state)

    case FILETREE_FOLD_NODE:
      var {node, shoudBeFolded, deep} = action
      if (!node.isDir) return state

      if (typeof shoudBeFolded === 'boolean') {
        var isFolded = shoudBeFolded
      } else {
        var isFolded = !node.isFolded
      }
      node.isFolded = isFolded
      if (deep) {
        node.forEachDescendant(childNode => {
          if (childNode.isDir) childNode.isFolded = isFolded
        })
      }
      return normalizeState(state)

    case FILETREE_REMOVE_NODE:
      var {node} = action
      RootNode.applyChangeToNode(node, 'delete')
      state.rootNode = RootNode
      return normalizeState(state)

    default:
      return state
  }
}
