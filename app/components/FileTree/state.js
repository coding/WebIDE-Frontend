import _ from 'lodash'
import { createTransformer, toJS, extendObservable, observable, computed, action } from 'mobx'
import config from 'config'

const ROOT_PATH = ''
const nodeSorter = (a, b) => {
  // node.isDir comes first
  // then sort by node.path alphabetically
  if (a.isDir && !b.isDir) return -1
  if (a.path < b.path) return -1
  if (a.path > b.path) return 1
  return 0
}

const stateToJS = createTransformer(state => {
  return {
    nodes: state.nodes.values().map(node => toJS(node)),
    contextMenuState: toJS(state.contextMenuState),
    focusedNodes: state.focusedNodes.map(node => toJS(node)),
  }
})

const state = observable({
  nodes: observable.map(),
  contextMenuState: {
    isActive: false,
    pos: { x: 0, y: 0 },
    contextNode: null,
  },
  get focusedNodes () {
    return this.nodes.values().filter(node => node.isFocused).sort(nodeSorter)
  },
  get root () {
    return this.nodes.get(ROOT_PATH)
  },
  toJS () {
    return stateToJS(this)
  }
})

class Node {
  constructor (nodeInfo) {
    const {
      name,
      path,
      isDir,
      gitStatus,
      isFolded,
      isFocused,
      isHighlighted,
      contentType,
      size,
    } = nodeInfo

    extendObservable(this, {
      name: name,
      path: path,
      isDir: isDir,
      gitStatus: gitStatus,
      isFolded: _.isBoolean(isFolded) ? isFolded : true,
      isFocused: _.isBoolean(isFocused) ? isFocused : false,
      isHighlighted: _.isBoolean(isHighlighted) ? isHighlighted : false,
      contentType: contentType,
      size: size,
    })

    state.nodes.set(this.path, this)
  }

  // this is solely for triggering re-render of a redux-connected component
  // with mobx this won't be necessary
  reconstruct () {
    state.nodes.set(this.path, new Node(this))
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
    return state.nodes.get(parentPath)
  }

  @computed
  get children () {
    const depth = this.depth
    return state.nodes.values()
      .filter(node => {
        return node.path.startsWith(`${this.path}/`) && node.depth === depth + 1
      })
      .sort(nodeSorter)
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
  }

  @action
  unfocus () {
    if (!this.isFocused) return
    this.isFocused = false
  }

  @action
  fold () {
    if (!this.isDir || this.isFolded) return
    this.isFolded = true
  }

  @action
  unfold () {
    if (!this.isDir || !this.isFolded) return
    this.isFolded = false
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
  }

  @action
  unhighlight () {
    if (!this.isDir || !this.isHighlighted) return
    this.isHighlighted = false
  }
}

state.nodes.set(ROOT_PATH, new Node({
  path: ROOT_PATH,
  name: config.projectName,
  isDir: true,
  isFolded: false,
}))

export default state
export { Node }
