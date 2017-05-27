import RandColors from './RandColors'

class Commit {
  constructor (props, state) {
    this.state = state
    // do not reconstruct! if found in commits, just return it.
    const commit = this.state.commits.get(props.id)
    if (commit) return commit
    this.id = props.id
    this.parentIds = props.parentIds
    this.author = props.author
    this.date = props.date
    this.message = props.message
  }

  id = ''
  parentIds = []
  author = { name: '', email: '' }
  date = 0
  message = ''
  laneId = ''

  isBaseOfMerge (child) {
    return child.parentIds.indexOf(this.id) === 0
  }

  get lane () {
    return this.state.lanes.get(this.laneId)
  }

  get col () {
    return this.lane.col
  }

  get shortId () {
    return this.id.slice(0, 7)
  }

  get parents () {
    return this.parentIds.map(id => this.state.commits.get(id))
  }

  get children () {
    const childrenIndex = this.state.childrenIndexes.get(this.id)
    if (!childrenIndex) return []
    return childrenIndex.map(childId => this.state.commits.get(childId))
  }

  get index () {
    return Array.from(this.state.commits.values()).indexOf(this)
  }

  get isLeaf () {
    return (this.children.length === 0)
  }

  get isBranched () {
    return (this.children.length > 1)
  }

  get isMerged () {
    return (this.parentIds.length > 1)
  }

  get isRoot () {
    return (this.parentIds.length === 0)
  }

  get isSpecial () {
    return (this.isLeaf || this.isMerged || this.isBranched || this.isRoot)
  }

  get refs () {
    return this.state.refs.entries().filter(([ref, id]) => id === this.id).map(([ref, id]) => ref)
  }
}

function getAvailableCol (columnSlots) {
  let availableCol
  for (let i = 0; availableCol === undefined; i++) {
    const isColumnAvailable = !columnSlots[i]
    if (isColumnAvailable) {
      availableCol = i
      break
    }
  }
  return availableCol
}

export default class CommitsState {
  constructor (rawCommits) {
    this.commits = new Map()
    this.lanes = new Map()
    this.refs = new Map()
    this.childrenIndexes = new Map()
    this.randColors = new RandColors()
    this.livingLaneIdsAtIndex = [[]]

    rawCommits.forEach(rawCommit => {
      const commit = new Commit(rawCommit, this)
      this.push(commit)
    })
  }

  assignNewLane (commit) {
    const self = this
    const newLane = {
      id: commit.id,
      start: commit.id,
      startTime: commit.date,
      color: this.randColors.get(),
      // get col () {
      //   if (typeof this._col === 'number') return this._col
      //   const startCommit = self.commits.get(this.id)
      //   const livingLaneIds = self.livingLaneIdsAtIndex[startCommit.index]
      //   const livingLanes = livingLaneIds.map(laneId => self.lanes.get(laneId))
      //   const columnSlots = livingLanes.reduce((acc, lane) => {
      //     acc[lane.col] = true
      //     return acc
      //   }, [])
      //   this._col = getAvailableCol(columnSlots)
      //   return this._col
      // }
      get col () {
        const startCommit = self.commits.get(this.id)
        const livingLaneIds = self.livingLaneIdsAtIndex[startCommit.index]
        return livingLaneIds.length - 1
      }
    }
    this.lanes.set(newLane.id, newLane)
    commit.laneId = newLane.id
  }

  markEndOfLane (commit) {
    const lane = this.lanes.get(commit.laneId)
    lane.end = commit.id
    lane.endTime = commit.date
  }

  makeChildrenIndexes (childId, parentId) {
    let childrenIndex = this.childrenIndexes.get(parentId)
    if (!childrenIndex) {
      childrenIndex = []
      this.childrenIndexes.set(parentId, childrenIndex)
    }
    if (!childrenIndex.includes(childId)) childrenIndex.push(childId)
  }

  push (commit) {
    this.commits.set(commit.id, commit)

    commit.parentIds.forEach(parentId => {
      this.makeChildrenIndexes(commit.id, parentId)
    })

    /* eslint-disable */
    switch (commit.children.length) {
      case 0:   // commit.isLeaf
        this.assignNewLane(commit)
        break

      case 1:   // commit has one single child
        const child = commit.children[0]

        // ATTENTION: this condition is suspicious, need more research:
        if (child.isMerged && !commit.isBaseOfMerge(child)) {
          this.assignNewLane(commit)
        } else {
          commit.laneId = child.laneId
        }
        break

      default:   // commit has many children
        // 1. find which branch the current commit belongs to

        // sort children by col, from low to high

        // @fixme!!!
        const children = commit.children.concat().sort(
          (a, b) => a.lane.col - b.lane.col
        )

        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          if (!child.isMerged) {
            commit.laneId = child.laneId
            break
          } else if (commit.isBaseOfMerge(child)) {
            commit.laneId = child.laneId
            break
          }
        }

        if (!commit.laneId) this.assignNewLane(commit)

        // 2. revoke some lane since here the commit is branched
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

            // if it is the eldest ancestor, it has every right to revoke this lane
            if (eldestAncestorIndex === commit.index) {
              childColsToFree.push(child)
            }
            // however, there's another case to consider
            else if (commit.isBaseOfMerge(child)) {
              childColsToFree.push(child)
            }
          }
        })

        childColsToFree = childColsToFree.filter(child => child.laneId !== commit.laneId)
        childColsToFree.forEach(child => this.markEndOfLane(child))
    }

    if (commit.isRoot) this.markEndOfLane(commit)

    const livingLaneIds = this.livingLaneIdsAtIndex[commit.index] = []
    this.lanes.forEach((lane, laneId) => {
      if (lane.end === undefined) livingLaneIds.push(laneId)
    })
  }
}
