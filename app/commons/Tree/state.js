import _ from 'lodash'
import { observable, computed, action, autorun } from 'mobx'

function TreeNodeScope () {

const SHADOW_ROOT_NODE = 'SHADOW_ROOT_NODE'
const state = observable({
  entities: observable.map({}),
  get shadowRoot () { return this.entities.get(SHADOW_ROOT_NODE) },
})

class TreeNode {
  constructor (props) {
    this.id = _.isUndefined(props.id) ? _.uniqueId('tree_node_') : props.id

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

    state.entities.set(this.id, this)
  }

  @observable _isDir = false
  @observable _name = ''
  @computed get name () { return this._name }
  set name (v) { return this._name = v }
  @computed get isDir () { return this._isDir }
  set isDir (v) { return this._isDir = v }

  @observable isFolded = true
  @observable isFocused = false
  @observable isHighlighted = false
  @observable parentId = undefined
  @observable index = 0

  @computed get isShadowRoot () {
    return this.id === SHADOW_ROOT_NODE
  }

  @computed get parent () {
    let parent
    if (typeof this.parentId === 'string') parent = state.entities.get(this.parentId)
    // don't allow recurse to self
    if (this.id === SHADOW_ROOT_NODE) return null
    if (parent === this) { throw Error(`Node ${this.id} is parent of itself...` ) }
    return parent ? parent : state.shadowRoot
  }
  set parent (parent) { this.parentId = parent.id }

  @computed get depth () {
    if (this.isShadowRoot) return -1
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
    if (this.isShadowRoot) return this
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
    } else if (this.isShadowRoot) {
      return this
    }

    const nextNode = this.next
    if (nextNode) return nextNode
    if (this.parent.isShadowRoot) return this
    return this.parent.next

  }

  @action forEachDescendant (handler) {
    if (!this.isDir) return
    this.children.forEach((childNode, i) => {
      handler(childNode, i)
      childNode.forEachDescendant(handler)
    })
  }

  @action focus () {
    if (this.isShadowRoot) return
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
  isFolded: false,
})
state.entities.set(SHADOW_ROOT_NODE, shadowRootNode)

autorun(() => {
  state.entities.forEach(parentNode => {
    if (!parentNode) return
    parentNode.children.forEach((node, i) => {
      if (node.index !== i) node.index = i
    })
  })
})

return { state, TreeNode }

}

export default TreeNodeScope
