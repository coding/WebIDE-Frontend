/* @flow weak */
import _ from 'lodash'
import { Map, Record } from 'immutable'
import { handleActions } from 'redux-actions'
import {
  GIT_STATUS,
  GIT_STATUS_FOLD_NODE,
  GIT_STATUS_SELECT_NODE,
  GIT_STATUS_STAGE_NODE,
  GIT_BRANCH,
  GIT_CHECKOUT,
  GIT_UPDATE_COMMIT_MESSAGE,
  GIT_CURRENT_BRANCH,
  GIT_UPDATE_STASH_MESSAGE,
  GIT_UPDATE_STASH_LIST,
  GIT_SELECT_STASH,
  GIT_UPDATE_UNSTASH_IS_POP,
  GIT_UPDATE_UNSTASH_IS_REINSTATE,
  GIT_UPDATE_UNSTASH_BRANCH_NAME,
  GIT_REBASE_STATE,
  GIT_COMMIT_DIFF,
  GIT_TAGS,
  GIT_HISTORY,
  GIT_HISTORY_CONTEXT_MENU_CLOSE,
  GIT_HISTORY_CONTEXT_MENU_OPEN,
} from './actions'

const _state = {
  isWorkingDirClean: true,
  statusFiles: Map(),
  commitMessage: '',
  branches: {
    current: 'master'
  },
  tags: [],
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
  rebase: {
    state: ''
  },
  commitDiff: {
    title: '',
    ref: null,
    oldRef: null,
    filesMap: Map(),
    files: []
  },
  history: {
    data: [],
    page: 0,
    size: 4,
    isEnd: false,
    contextMenu: {
      isActive: false,
      pos: { x: 0, y: 0 },
      contextNode: null,
    }
  }
}

const FileTreeNode = Record({
  name: '',
  path: '',
  status: '',
  isFolded: false,
  isFocused: false,
  isStaged: false,
  depth: 0,
  isDir: false,
  isRoot: false,
  children: null,
  leafNodes: null,
  parent: null
})

const treeifyFiles = (files) => {
  let rootNode = new FileTreeNode({
    name: '/',
    path: '/',
    isRoot: true,
    isDir: true,
    isFocused: false,
    children: [],
    leafNodes: []
  })
  let _nodes = Map()
  _nodes = _nodes.set(rootNode.path, rootNode)

  rootNode = files.reduce((rootNode, file) => {
    let pathComps = file.name.split('/')

    pathComps.reduce((parentNode, pathComp, idx) => {
      let currentPath = parentNode.path
        + (parentNode.path.endsWith('/')? '' : '/')
        + pathComp

      let node = _nodes.get(currentPath)

      let commonNodeProps = {
        name: pathComp,
        path: currentPath,
        parent: parentNode.path,
        depth: parentNode.depth + 1
      }
      if (idx === pathComps.length - 1) {
        if (!node) node = new FileTreeNode({
          ...commonNodeProps,
          isDir: false,
          status: file.status
        })
      } else {
        if (!node) node = new FileTreeNode({
          ...commonNodeProps,
          isDir: true,
          children: [],
          leafNodes: [],
        })
      }

      // record of direct children
      if (!parentNode.children.includes(node.path)) {
        parentNode.children.push(node.path)
      }
      // also keep a record of leaf nodes at each internal dir nodes
      if (parentNode.isDir && !parentNode.leafNodes.includes('/'+file.name)) {
        parentNode.leafNodes.push('/'+file.name)
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
    let statusFiles = treeifyFiles(action.payload.files)
    let isWorkingDirClean = action.payload.isClean
    return {...state, statusFiles, isWorkingDirClean}
  },

  [GIT_STATUS_FOLD_NODE]: (state, action) => {
    let {node, isFolded, deep} = action.payload
    if (!node.isDir) return state

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
    let statusFiles = state.statusFiles.map((_node) => {
      if (_node.path === node.path) {
        return _node.set('isFocused', true)
      } else if (_node.isFocused) {
        return _node.set('isFocused', false)
      } else {
        return _node
      }
    })
    return {...state, statusFiles}
  },

  [GIT_STATUS_STAGE_NODE]: (state, action) => {
    let node = action.payload
    let statusFiles = state.statusFiles
    if (!node.isDir) {
      statusFiles = state.statusFiles.set(node.path,
        node.set('isStaged', node.isStaged ? false : true)
      )
    } else {
      let stagedLeafNodes = node.leafNodes.filter(leafNodePath =>
        state.statusFiles.get(leafNodePath).get('isStaged')
      )
      let allLeafNodesStaged = (stagedLeafNodes.length === node.leafNodes.length)

      statusFiles = state.statusFiles.withMutations(statusFiles => {
        node.leafNodes.forEach(leafNodePath => {
          let leafNode = statusFiles.get(leafNodePath)
          statusFiles.set(leafNodePath, leafNode.set('isStaged', allLeafNodesStaged ? false : true))
        })
        return statusFiles
      })
    }
    return {...state, statusFiles}
  },


  [GIT_UPDATE_COMMIT_MESSAGE]: (state, action) => {
    return {...state, commitMessage: action.payload}
  },

  [GIT_BRANCH]: (state, action) => {
    state = _.cloneDeep(state)
    state.branches = action.payload.branches
    return state
  },

  [GIT_TAGS]: (state, action) => {
    state = _.cloneDeep(state)
    state.tags = action.payload.tags
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
  [GIT_REBASE_STATE]: (state, action) => {
    state = _.cloneDeep(state)
    state.rebase.state = action.payload
    return state
  },
  [GIT_COMMIT_DIFF]: (state, action) => {
    state = _.cloneDeep(state)
    state.commitDiff.title = action.payload.title
    state.commitDiff.ref = action.payload.ref
    state.commitDiff.oldRef = action.payload.oldRef
    state.commitDiff.files = action.payload.files
    state.commitDiff.filesMap = treeifyFiles(action.payload.files)
    return state
  },
  [GIT_HISTORY]: (state, action) => {
    state = _.cloneDeep(state)
    let data = null
    if (action.payload.reset) {
      data = action.payload.res
    } else {
      data = state.history.data.concat(action.payload.res)
    }
    state.history = {
      ...state.history,
      data,
      isEnd: action.payload.res.length < state.history.size
    }
    return state
  },
  [GIT_HISTORY_CONTEXT_MENU_OPEN]: (state, action) => {
    state = _.cloneDeep(state)
    state.history = {
      ...state.history,
      contextMenu: action.payload
    }
    return state
  },
  [GIT_HISTORY_CONTEXT_MENU_CLOSE]: (state, action) => {
    state = _.cloneDeep(state)
    state.history = {
      ...state.history,
      contextMenu: {
        ...state.history.contextMenu,
        isActive: false
      }
    }
    return state
  }
}, _state)
