import _ from 'lodash'
import { extendObservable, observable, computed, action } from 'mobx'

function TreeNodeScope () {

const SHADOW_ROOT_NODE = 'SHADOW_ROOT_NODE'
const state = observable({
  entities: observable.map({}),
  get shadowRoot () { return this.entities.get(SHADOW_ROOT_NODE) },
})

class TreeNode {
  constructor (props) {
    this.id = props.id || _.uniqueId('tree_node_')

    const filePlaceholder = {}
    this.file = props.file || filePlaceholder

    if (_.isBoolean(props.isDir)) this._isDir = props.isDir
    if (_.isString(props.name)) this._name = props.name
    if (_.isBoolean(props.isFolded)) this.isFolded = props.isFolded
    if (_.isBoolean(props.isFocused)) this.isFocused = props.isFocused
    if (_.isBoolean(props.isHighlighted)) this.isHighlighted = props.isHighlighted
    if (_.isNumber(props.index)) this.index = props.index

    if (props.parent) {
      this.parent = props.parent
    } else if (props.parentId) {
      this.parentId = props.parentId
    }

    // bind treeNode to its fileNode
    // this.file.tree = this
    if (this.file === filePlaceholder) this.file = null

    state.entities.set(this.id, this)
  }

  @observable _isDir = null
  @observable _name = null
  @observable file = null
  @observable isFolded = true
  @observable isFocused = false
  @observable isHighlighted = false
  @observable parentId = ''
  @observable index = 0

  @computed get name () {
    if (this._name !== null) return this._name
    if (this.file) return this.file.name
    return ''
  }

  @computed get isDir () {
    if (this._isDir !== null) return this._isDir
    if (this.file) return this.file.isDir
    return false
  }

  @computed get isRoot () {
    return this.id === SHADOW_ROOT_NODE
  }

  @computed get parent () {
    if (this.parentId) return state.entities.get(this.parentId)
    if (this.file && this.file.parent && this.file.parent.tree) {
      return this.file.parent.tree
    }
    return state.entities.get(SHADOW_ROOT_NODE)
  }
  set parent (parent) { this.parentId = parent.id }

  @computed get depth () {
    if (this.isRoot) return -1
    return this.parent.depth + 1
  }

  @computed get children () {
    return state.entities.values()
      .filter(node => node.parent === this)
      .sort((a, b) => a.index - b.index)
  }

  @computed get siblings () {
    return this.parent.children
  }

  @computed get prev () {
    return this.siblings[this.index - 1]
  }

  @computed get next () {
    return this.siblings[this.index + 1]
  }

  @computed get firstChild () {
    return this.children[0]
  }

  @computed get lastChild () {
    return this.children[this.children.length - 1]
  }

  @computed get lastVisibleDescendant () {
    const lastChild = this.lastChild
    if (!lastChild) return this
    if (!lastChild.isDir) return lastChild
    if (lastChild.isFolded) return lastChild
    return lastChild.lastVisibleDescendant
  }

  @computed get getPrev () {
    if (this.isRoot) return this
    const prevNode = this.prev
    if (prevNode) {
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

  @computed get getNext () {
    if (this.isDir && !this.isFolded) {
      if (this.firstChild) return this.firstChild
    } else if (this.isRoot) {
      return this
    }

    const nextNode = this.next
    if (nextNode) return nextNode
    if (this.parent.isRoot) return this
    return this.parent.getNext

  }

  @action forEachDescendant (handler) {
    if (!this.isDir) return
    this.children.forEach((childNode) => {
      handler(childNode)
      childNode.forEachDescendant(handler)
    })
  }

  @action focus () {
    this.isFocused = true
  }

  @action unfocus () {
    this.isFocused = false
  }

  @action fold () {
    if (!this.isDir || this.isFolded) return
    this.isFolded = true
  }

  @action unfold () {
    if (!this.isDir || !this.isFolded) return
    this.isFolded = false
  }

  @action toggleFold (shouldBeFolded) {
    if (shouldBeFolded) {
      this.fold()
    } else {
      this.unfold()
    }
  }

  @action highlight () {
    if (!this.isDir || this.isHighlighted) return
    this.isHighlighted = true
  }

  @action unhighlight () {
    if (!this.isDir || !this.isHighlighted) return
    this.isHighlighted = false
  }
}

const shadowRootNode = new TreeNode({
  id: SHADOW_ROOT_NODE,
  isDir: true,
})
state.entities.set(SHADOW_ROOT_NODE, shadowRootNode)

return { state, TreeNode }

}

export default TreeNodeScope
