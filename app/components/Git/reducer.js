/* @flow weak */
import _ from 'lodash'
import { Map, Record } from 'immutable'
import { handleActions } from 'redux-actions'
import {
  GIT_STATUS,
  GIT_STATUS_FOLD_NODE,
  GIT_STATUS_SELECT_NODE,
  GIT_BRANCH,
  GIT_CHECKOUT,
  GIT_STAGE_FILE,
  GIT_UNSTAGE_FILE,
  GIT_UPDATE_COMMIT_MESSAGE,
  GIT_CURRENT_BRANCH,
  GIT_UPDATE_STASH_MESSAGE,
  GIT_UPDATE_STASH_LIST,
  GIT_SELECT_STASH,
  GIT_UPDATE_UNSTASH_IS_POP,
  GIT_UPDATE_UNSTASH_IS_REINSTATE,
  GIT_UPDATE_UNSTASH_BRANCH_NAME,
} from './actions'

const _state = {
  workingDir: {
    isClean: true,
    files: []
  },
  statusFiles: Map(),
  stagingArea: {
    files: [],
    commitMessage: ''
  },
  branches: {
    current: 'master'
  },
  stash: {
    stashMessage: '',
  },
  unstash: {
    stashList: [],
    selectedStash: null,
    isPop: false,
    isReinstate: false,
    newBranchName: '',
  },
}

const FileTreeNode = Record({
  name: '',
  path: '',
  isFolded: false,
  isFocused: false,
  isDir: false,
  isRoot: false,
  children: null
})

const treeifyFiles = (files) => {
  let rootNode = new FileTreeNode({
    name: '/',
    path: '/',
    isRoot: true,
    isDir: true,
    isFocused: false,
    children: []
  })
  let _nodes = Map()
  _nodes = _nodes.set(rootNode.path, rootNode)

  rootNode = files.reduce((rootNode, file) => {
    let pathComps = file.name.split('/')

    pathComps.reduce((parentNode, pathComp, idx) => {
      var currentPath = parentNode.path
        + (parentNode.path.endsWith('/')? '' : '/')
        + pathComp

      var node = _nodes.get(currentPath)

      if (idx === pathComps.length - 1) {
        if (!node) node = new FileTreeNode({
          name: pathComp,
          isDir: false,
          path: currentPath
        })
      } else {
        if (!node) node = new FileTreeNode({
          name: pathComp,
          isDir: true,
          path: currentPath,
          children: []
        })
      }
      if (!parentNode.children.includes(node.path)) {
        parentNode.children.push(node.path)
      }
      _nodes = _nodes.set(node.path, node)
      return node
    }, rootNode)

    return rootNode
  }, rootNode)

  return _nodes
}

export default handleActions({
  [GIT_STATUS]: (state, action) => {
    state = _.cloneDeep(state)
    // git commit original:
    state.workingDir = Object.assign({}, state.workingDir, action.payload)
    // git commit new implementation:
    state.files = action.payload.files
    state.statusFiles = treeifyFiles(action.payload.files)
    state.isWorkingDirectoryClean = action.payload.isClean
    return state
  },
  [GIT_STATUS_FOLD_NODE]: (state, action) => {
    let {node, shouldBeFolded, deep} = action.payload
    if (!node.isDir) return state

    if (typeof shouldBeFolded === 'boolean') {
      var isFolded = shouldBeFolded
    } else {
      var isFolded = !node.isFolded
    }
    state.statusFiles = state.statusFiles.set(node.path, node.set('isFolded', isFolded))
    if (deep) {
      node.children.forEach(childNodePath => {
        let childNode = state.statusFiles.get(childNodePath)
        if (childNode.isDir) {
          state.statusFiles = state.statusFiles.set(childNodePath, childNode.set('isFolded', isFolded))
        }
      })
    }
    return {...state}
  },
  [GIT_STATUS_SELECT_NODE]: (state, action) => {
    let node = action.payload
    state.statusFiles = state.statusFiles.map((_node) => {
      if (_node.path === node.path) {
        return _node.set('isFocused', true)
      } else if (_node.isFocused) {
        return _node.set('isFocused', false)
      } else {
        return _node
      }
    })
    return {...state}
  },

  [GIT_UPDATE_COMMIT_MESSAGE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.commitMessage = action.payload
    return state
  },
  [GIT_STAGE_FILE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.files = _.union(state.stagingArea.files, [action.payload.name])
    return state
  },
  [GIT_UNSTAGE_FILE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stagingArea.files = _.without(state.stagingArea.files, action.payload.name)
    return state
  },
  [GIT_BRANCH]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches = action.payload.branches
    return state
  },
  [GIT_CHECKOUT]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches.current = action.payload.branch
    return state
  },
  [GIT_CURRENT_BRANCH]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches.current = action.payload.name
    return state
  },
  [GIT_UPDATE_STASH_MESSAGE]: (state, action) => {
    state = _.cloneDeep(state)
    state.stash.stashMessage = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_IS_POP]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.isPop = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_IS_REINSTATE]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.isReinstate = action.payload
    return state
  },
  [GIT_UPDATE_UNSTASH_BRANCH_NAME]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.newBranchName = action.payload
    return state
  },
  [GIT_UPDATE_STASH_LIST]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.stashList = action.payload
    if (state.unstash.stashList.length == 0) {
      state.unstash.selectedStash = null
    } else if(!state.unstash.selectedStash) {
      state.unstash.selectedStash = state.unstash.stashList[0]
    }
    return state
  },
  [GIT_SELECT_STASH]: (state, action) => {
    state = _.cloneDeep(state)
    state.unstash.selectedStash = action.payload
    return state
  },
}, _state)
