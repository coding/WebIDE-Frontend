import { observable, computed, action, runInAction } from 'mobx'
import sha1 from './sha1'
import state, { Commit }from './state'
import api from 'backendAPI'

const enums = {
  colors: ['#4285f4', '#fbbc05', '#ea4335', '#34a853', '#6285f4', '#5bcc05', '#aa7355', '#44f003'],
  authors: [
    {name: 'hackape', email: 'zhangshuo@coding.net'},
    {name: 'vangie', email: 'duwan@coding.net'},
    {name: 'tanhe123', email: 'tanhehe@coding.net'},
    {name: 'candy', email: 'zhengxinqi@coding.net'},
  ],
  messages: [
    'a quick brown fox jumps over a lazy dog',
    'hello world!',
    'fix some bugs',
    'may the force be with you',
  ],
}

function randQuater () { return Math.floor(Math.random()*4) }
function rand (n) { return Math.floor(Math.random()*n) }

function getCol (commit) {
  let availableCol = undefined
  for (let i = 0; true ; i++) {
    const isColumnAvailable = !Boolean(state.columnSlots.get(i))
    if (isColumnAvailable) {
      availableCol = i
      break
    }
  }
  console.log(`Commit ${commit.shortId}, request a new col ${availableCol}`, commit)
  state.columnSlots.set(availableCol, 1)
  return availableCol
}

function freeCol (col, commit, child) {
  state.columnSlots.set(col, 0)
  if (commit && child) console.log(`Commit ${commit.shortId}, free a col ${col}`, commit, 'children: ', child.shortId)
}

const makeChildrenIndexes = action('makeChildrenIndexes', (childCommit, parentCommit) => {
  let childrenIndex = state.childrenIndexes.get(parentCommit.id)
  if (!childrenIndex) {
    childrenIndex = observable.shallowArray([])
    state.childrenIndexes.set(parentCommit.id, childrenIndex)
  }
  if (!childrenIndex.includes(childCommit.id)) childrenIndex.push(childCommit.id)
})

const calculColumn = action(function (commit) {
  // if (!commit.isSpecial && typeof commit.col !== 'number') commit.col = commit.children[0].col

  if (commit.isLeaf) {
    const col = getCol(commit)
    const newBranch = { col, start: commit.id, color: enums.colors[rand(8)] }
    state.branches.set(commit.id, newBranch)
  }

  if (commit.isBranched) {
    // we revoke some col since here the commit is branched
    const children = commit.children.slice(1)
    children.forEach(child => {
      if (child.parentIds.length === 1) freeCol(child.col, commit, child)
    })
    // state.availCol -= (commit.children.length - 1)
    // commit.col = state.availCol - 1
  }

  if (commit.children.length === 1) {
    const child = commit.children[0]
    if (child.isMerged && child.parentIds.indexOf(commit.id)) {
      const col = getCol(commit)
      const newBranch = { col, start: commit.id, color: enums.colors[rand(8)] }
      state.branches.set(commit.id, newBranch)
    }
  }

  if (commit.isRoot) {
    freeCol(commit.col, commit)
  }
})

export function genData () {
  api.gitLogs().then(allCommits => {
    // initialize the state
    allCommits.forEach(commitProps => {
      runInAction( () => {

      const commit = new Commit(commitProps)
      state.commits.set(commit.id, commit)
      commit.parentIds.forEach(parentId => {
        makeChildrenIndexes(commit, { id: parentId })
      })
      calculColumn(commit)

      })

    })
  })
}

export default state

