import { observable, computed, action, autorun } from 'mobx'

const state = observable({
  commits: observable.map({}),
  refs: observable.map({}),
  childrenIndexes: observable.map({}),
  columnSlots: observable.map({}),
  branches: observable.map({}),
  get availCol () {
    for (let i = 0; true ; i++) {
      const isColumnAvailable = !this.columnSlots.get(i)
      if (isColumnAvailable) return i
    }
  },
  maxCol: 0,
  get commitList () {
    return this.commits.values()
  }
})

autorun(() => {
  if (state.maxCol < state.availCol) state.maxCol = state.availCol
})

class Commit {
  constructor (props) {
    this.id = props.id
    this.author = props.author
    this.date = props.date
    this.message = props.message
    this.parentIds = props.parentIds
  }

  @observable id = ''
  @observable parentIds = []
  @observable author = { name: '', email: '' }
  @observable date = 0
  @observable message = ''
  @observable color = ''

  @computed get col () {
    return this.branch.col
  }

  @computed get branch () {
    const branch = state.branches.get(this.id)
    if (branch) return branch
    if (this.children.length === 0) return null
    if (this.children.length >= 1) return this.children[0].branch
  }

  @computed get shortId () {
    return this.id.slice(0, 6)
  }

  @computed get parents () {
    return this.parentIds.map(id => state.commits.get(id))
  }

  @computed get children () {
    const childrenIndex = state.childrenIndexes.get(this.id)
    if (!childrenIndex) return []
    return childrenIndex.map(childId => state.commits.get(childId))
  }

  @computed get index () {
    return state.commitList.indexOf(this)
  }

  @computed get isLeaf () {
    return (this.children.length === 0)
  }

  @computed get isBranched () {
    return (this.children.length > 1)
  }

  @computed get isMerged () {
    return (this.parentIds.length > 1)
  }

  @computed get isRoot () {
    return (this.parentIds.length === 0)
  }

  @computed get isSpecial () {
    return (this.isLeaf || this.isMerged || this.isBranched || this.isRoot)
  }

  @computed get specialChild () {
    if (this.isLeaf) return null
    const youngestChild = this.children[0]
    if (youngestChild.isSpecial) return youngestChild
    return youngestChild.specialChild
  }

  @computed get refs () {
    return state.refs.entries().filter(([ref, id]) => id === this.id).map(([ref, id]) => ref)
  }
}

export default state
export { Commit }
