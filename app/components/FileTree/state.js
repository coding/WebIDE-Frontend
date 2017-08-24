import _ from 'lodash'
import { TreeNodeScope } from 'commons/Tree'
import { FileState } from 'commons/File'
import { createTransformer, toJS, extendObservable, observable, computed, action } from 'mobx'

const { state, TreeNode } = TreeNodeScope()
const nodeSorter = (a, b) => {
  // node.isDir comes first
  // then sort by node.path alphabetically
  if (a.isDir && !b.isDir) return -1
  if (a.path < b.path) return -1
  if (a.path > b.path) return 1
  return 0
}

const stateToJS = createTransformer(state => ({
  entities: state.entities.values().map(node => toJS(node)),
  focusedNodes: state.focusedNodes.map(node => toJS(node)),
}))

const ROOT_PATH = ''
extendObservable(state, {
  get focusedNodes () {
    return this.entities.values().filter(node => node.isFocused).sort(nodeSorter)
  },
  get gitStatus () {
    return this.entities.values().filter(node => !node.isDir && node.gitStatus !== 'CLEAN')
  },
  get root () {
    return this.entities.get(ROOT_PATH)
  },
  toJS () {
    return stateToJS(this)
  }
})

class FileTreeNode extends TreeNode {
  constructor (props) {
    const path = props.file ? props.file.path : props.path
    super({ ...props, id: path })
    this.path = path
    if (this.path === ROOT_PATH) {
      this.isFolded = false
      this.index = 0
      this._parentId = state.shadowRoot.id
    }
  }

  @observable path = null

  // override default name / isDir behavior
  @computed get name () {
    return this.file.name
  }

  @computed get isDir () {
    return this.file.isDir
  }

  @computed get file () {
    return FileState.entities.get(this.path)
  }

  @computed get parent () {
    // prioritize corresponding file's tree node
    if (this.file) {
      const parentFile = this.file && this.file.parent
      if (parentFile === null) return state.shadowRoot
      return state.entities.get(parentFile.path)
    }
    return null
  }

  @computed get children () {
    return state.entities.values()
      .filter(node => node.parent === this)
      .sort(nodeSorter)
  }

  @computed get gitStatus () {
    if (this.file) return this.file.gitStatus
  }

  @computed get contentType () {
    if (this.file) return this.file.contentType
  }

  @computed get size () {
    if (this.file) return this.file.size
  }
}

export default state
export { FileTreeNode, TreeNode }
