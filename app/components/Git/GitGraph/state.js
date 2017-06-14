import { observable, computed, action, autorun, autorunAsync, runInAction } from 'mobx'
import { RandColors } from './helpers'

const randColors = new RandColors()
const state = observable({
  commits: observable.map({}),         // canonic source of truth!!!
  childrenIndexes: observable.map({}), // it goes with new data flowing into source
  refs: observable.map({}),
  columnSlots: observable.map({}),
  get availCol () {
    for (let i = 0; ; i++) {
      const isColumnAvailable = !this.columnSlots.get(i)
      if (isColumnAvailable) return i
    }
  },
  maxCol: 0,
  livingBranchesAtIndex: observable.ref([]),
  commitsList: observable.shallowArray([])
})

const branches = {}
// NOTE:
/*
  Simply track col availability is probably not enough,
  we need to track lifecycle of lanes instead, that's much more assuring
 */

function getCol (commit) {
  let availableCol
  for (let i = 0; availableCol === undefined; i++) {
    const isColumnAvailable = !state.columnSlots.get(i)
    if (isColumnAvailable) {
      availableCol = i
      break
    }
  }
  state.columnSlots.set(availableCol, commit)
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

const assignNewBranch = (commit) => {
  const col = getCol(commit)
  const newBranch = { col, id: commit.id, color: randColors.get() }
  branches[newBranch.id] = newBranch
  commit.branch = newBranch
}

const calculColumnAndBranch = action((commit) => {
  /* eslint-disable */
  switch (commit.children.length) {
    case 0:   // commit.isLeaf
      assignNewBranch(commit)
      break

    case 1:   // commit has one single child
      const child = commit.children[0]

      // ATTENTION: this condition is suspicious, need more research:
      if (child.isMerged && !commit.isBaseOfMerge(child)) {
        assignNewBranch(commit)
      } else {
        commit.branch = child.branch
      }
      break

    default:   // commit has many children
      // 1. find which branch the current commit belongs to

      // sort children by col, from low to high
      const children = commit.children.concat().sort(
        (a, b) => a.branch.col - b.branch.col
      )

      for (let i = 0; i < children.length; i++) {
        const child = children[i]
        if (!child.isMerged) {
          commit.branch = child.branch
          break
        } else if (commit.isBaseOfMerge(child)) {
          commit.branch = child.branch
          break
        }
      }

      if (!commit._branchId) assignNewBranch(commit)

      // 2. revoke some col since here the commit is branched
      let childColsToFree = []
      commit.children.forEach(child => {
        // if child has only 1 parent, surely it's dead
        if (child.parentIds.length === 1) {
          childColsToFree.push(child)
        } else {
        // if child has more than one parent,
        // we need to check if the current commit is the eldest ancestor (not just direct parent),
        // if so, child is probably dead too
          function getEldestAncestorIndex (parents) {
            return parents.reduce((acc, parent) => {
              if (!parent) return Infinity
              if (parent === commit) return Math.max(commit.index, acc)
              return getEldestAncestorIndex(parent.parents)
            }, 0)
          }

          const eldestAncestorIndex = getEldestAncestorIndex(child.parents)

          // if it is the eldest ancestor, it has every right to revoke this col
          if (eldestAncestorIndex === commit.index) {
            childColsToFree.push(child)
          }
          // however, there's another case to consider
          else if (commit.isBaseOfMerge(child)) {
            childColsToFree.push(child)
          }
        }
      })

      childColsToFree = childColsToFree.filter(child => child.col !== commit.col)
      childColsToFree.forEach(child => freeCol(child.col))
  }
  /* eslint-enable */

  if (commit.isRoot) {
    freeCol(commit.col)
  }
})

autorun('track max col', () => {
  if (state.maxCol < state.availCol) state.maxCol = state.availCol
})
autorunAsync('Sync commitsList with commits', () => {
  state.commitsList.replace(state.commits.values())
}, 0)

state.commits.observe((change) => {
  const { name: commitId, newValue: commit, oldValue: commitOldValue } = change
  switch (change.type) {
    case 'add':
      commit.parentIds.forEach((parentId) => {
        makeChildrenIndexes(commit.id, parentId)
      })
      calculColumnAndBranch(commit)
    case 'update':


    case 'delete':

  }
})

class Commit {
  constructor (props) {
    // do not reconstruct! if found in commits, just return it.
    const commit = state.commits.get(props.id)
    if (commit) return commit
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
  @observable _branchId = ''

  @computed get col () {
    return this.branch.col
  }

  get branch () {
    const branch = branches[this._branchId]
    if (branch) return branch
    throw Error(`Branch calculation error, ${this.id} doesn't have a branch.`)
  }


  set branch (branch) {
    this._branchId = branch.id
  }

  isBaseOfMerge (child) {
    return child.parentIds.indexOf(this.id) === 0
  }

  @computed get shortId () {
    return this.id.slice(0, 7)
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
    return state.commits.values().indexOf(this)
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
