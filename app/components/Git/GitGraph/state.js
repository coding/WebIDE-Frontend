import { observable, computed, action, autorun, runInAction } from 'mobx'
import { RandColors } from './helpers'

const randColors = new RandColors()
const state = observable({
  commits: observable.map({}),         // canonic source of truth!!!
  childrenIndexes: observable.map({}), // it goes with new data flowing into source
  refs: observable.map({}),
  columnSlots: observable.map({}),
  branches: observable.map({}),
  get availCol () {
    for (let i = 0; ; i++) {
      const isColumnAvailable = !this.columnSlots.get(i)
      if (isColumnAvailable) return i
    }
  },
  maxCol: 0,
  get commitList () {
    return this.commits.values()
  }
})

function getCol () {
  let availableCol
  for (let i = 0; availableCol === undefined; i++) {
    const isColumnAvailable = !state.columnSlots.get(i)
    if (isColumnAvailable) availableCol = i
  }
  state.columnSlots.set(availableCol, 1)
  return availableCol
}

function freeCol (col) {
  state.columnSlots.set(col, 0)
}


const makeChildrenIndexes = action('makeChildrenIndexes', (childId, parentId) => {
  let childrenIndex = state.childrenIndexes.get(parentId)
  if (!childrenIndex) {
    childrenIndex = observable.shallowArray([])
    state.childrenIndexes.set(parentId, childrenIndex)
  }
  if (!childrenIndex.includes(childId)) childrenIndex.push(childId)
})

const calculColumn = action((commit) => {
  if (commit.isLeaf) {
    const col = getCol(commit)
    const newBranch = { col, start: commit.id, color: randColors.get() }
    state.branches.set(commit.id, newBranch)
  }

  if (commit.isBranched) {
    // we revoke some col since here the commit is branched
    const children = commit.children.slice(1)
    children.forEach(child => {
      if (child.parentIds.length === 1) freeCol(child.col, commit, child)
    })
  }

  if (commit.children.length === 1) {
    const child = commit.children[0]
    if (child.isMerged && child.parentIds.indexOf(commit.id)) {
      const col = getCol(commit)
      const newBranch = { col, start: commit.id, color: randColors.get() }
      state.branches.set(commit.id, newBranch)
    }
  }

  if (commit.isRoot) {
    freeCol(commit.col, commit)
  }
})

autorun('track max col', () => {
  if (state.maxCol < state.availCol) state.maxCol = state.availCol
})

state.commits.observe(change => {
  const { name: commitId, newValue: commit, oldValue: commitOldValue } = change
  switch (change.type) {
    case 'add':
      commit.parentIds.forEach(parentId => {
        makeChildrenIndexes(commit.id, parentId)
      })
      calculColumn(commit)
    case 'update':

    case 'delete':

  }
})


class Commit {
  constructor (props) {
    this.id = props.id
    this.author = props.author
    this.date = props.date
    this.message = props.message
    this.parentIds = props.parentIds
    runInAction(() => state.commits.set(this.id, this))
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
