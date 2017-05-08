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

const state = observable({
  nodes: observable.map(),
  get root () {
    return this.nodes.get(ROOT_PATH)
  },
})

class FileNode {
  constructor (nodeConfig) {
    const {
      name,
      path,
      isDir,
      gitStatus,
      contentType,
      size,
    } = nodeConfig

    extendObservable(this, {
      name: name,
      path: path,
      isDir: isDir,
      gitStatus: gitStatus,
      contentType: contentType,
      size: size,
    })

    state.nodes.set(this.path, this)
  }

  @observable tree = null

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
  get prev () {
    const siblings = this.siblings
    return siblings[siblings.indexOf(this) - 1]
  }

  @computed
  get next () {
    const siblings = this.siblings
    return siblings[siblings.indexOf(this) + 1]
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
  update (nodeConfig) {
    extendObservable(this, nodeConfig)
  }
}

state.nodes.set(ROOT_PATH, new FileNode({
  path: ROOT_PATH,
  name: config.projectName,
  isDir: true,
}))



export default state
export { state, FileNode }
