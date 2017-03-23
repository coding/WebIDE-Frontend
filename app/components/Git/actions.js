/* @flow weak */
import _ from 'lodash'
import api from '../../backendAPI'
import { notify, NOTIFY_TYPE } from '../Notification/actions'
import { showModal, addModal, dismissModal, updateModal } from '../Modal/actions'
import { createAction } from 'redux-actions'

export const GIT_STATUS = 'GIT_STATUS'
export const updateStatus = createAction(GIT_STATUS)

export const GIT_UPDATE_COMMIT_MESSAGE = 'GIT_UPDATE_COMMIT_MESSAGE'
export const updateCommitMessage = createAction(GIT_UPDATE_COMMIT_MESSAGE)

export function commit () {
  return (dispatch, getState) => {
    let GitState = getState().GitState
    let stagedFiles = GitState.statusFiles.filter(file => file.isStaged)
    let stagedFilesPathList = stagedFiles.toArray().map(stagedFile => stagedFile.path.replace(/^\//, ''))
    return api.gitCommit({
      files: stagedFilesPathList,
      message: GitState.commitMessage
    }).then(filetreeDelta => {
      dispatch(notify({message: 'Git commit success.'}))
      dispatch(dismissModal())
    })
  }
}

export function updateStagingArea (action, file) {
  if (action == 'stage') {
    return stageFile(file)
  } else {
    return unstageFile(file)
  }
}
export const GIT_FETCH = 'GIT_FETCH'
export function getFetch() {
  return dispatch => api.gitFetch().then(
      dispatch(notify({ message: 'Get Fetch Success'})))
}

export const GIT_BRANCH = 'GIT_BRANCH'
export function getBranches () {
  return (dispatch) => api.gitGetBranches().then(data => {
    data.local = data.local.filter(item => item != 'HEAD')
    data.remote = data.remote.filter(item => item != 'HEAD')
    dispatch(createAction(GIT_BRANCH)({ branches: data }))
  })
}

export const GIT_CHECKOUT = 'GIT_CHECKOUT'
export function checkoutBranch (branch, remoteBranch) {
  return dispatch => {
    api.gitCheckout(branch, remoteBranch).then(data => {
      dispatch(createAction(GIT_CHECKOUT)({ branch }))
      dispatch(notify({message: `Check out ${branch}`}))
    })
  }
}

export const GIT_DELETE_BRANCH = 'GIT_DELETE_BRANCH'
export function gitDeleteBranch (branch) {
  return dispatch => {
    api.gitDeleteBranch(branch)
    .then(() => {
      dispatch(notify({message: `deleted branch ${branch} success`}))
    })
  }
}

export const GIT_TAGS = 'GIT_TAGS'
export function getTags () {
  return (dispatch) => api.gitTags().then(data => {
    dispatch(createAction(GIT_TAGS)({ tags: data }))
  })
}

export function pull () {
  return dispatch => {
    api.gitPull().then(res => {
      if (res.code && res.code !== 0)
        dispatch(notify({message: `Git pull fail: ${res.msg}` }))
      else
        dispatch(notify({message: 'Git pull success.'}))
    })
  }
}

export function push () {
  return dispatch => {
    api.gitPushAll().then(res => {
      if (res.code && res.code !== 0)
        dispatch(notify({message: `Git push fail: ${res.msg}` }))
      else
        dispatch(notify({message: 'Git push success.'}))
    })
  }
}

export const GIT_CURRENT_BRANCH = 'GIT_CURRENT_BRANCH'
export const updateCurrentBranch = createAction(GIT_CURRENT_BRANCH)

export const GIT_UPDATE_STASH_MESSAGE = 'GIT_UPDATE_STASH_MESSAGE'
export const updateStashMessage = createAction(GIT_UPDATE_STASH_MESSAGE)

export function createStash (message) {
  return dispatch => api.gitCreateStash(message).then(res => {
    dispatch(notify({
      message: 'Git stash success.',
    }))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: res.msg,
    }))
    dispatch(dismissModal())
  })
}

export const GIT_UPDATE_STASH_LIST = 'GIT_UPDATE_STASH_LIST'
export const updateStashList = createAction(GIT_UPDATE_STASH_LIST)

export const GIT_UPDATE_UNSTASH_IS_POP = 'GIT_UPDATE_UNSTASH_IS_POP'
export const updateUnstashIsPop = createAction(GIT_UPDATE_UNSTASH_IS_POP)

export const GIT_UPDATE_UNSTASH_IS_REINSTATE = 'GIT_UPDATE_UNSTASH_IS_REINSTATE'
export const updateUnstashIsReinstate = createAction(GIT_UPDATE_UNSTASH_IS_REINSTATE)

export const GIT_UPDATE_UNSTASH_BRANCH_NAME = 'GIT_UPDATE_UNSTASH_BRANCH_NAME'
export const updateUnstashBranchName = createAction(GIT_UPDATE_UNSTASH_BRANCH_NAME)

export function getStashList () {
  return (dispatch) => api.gitStashList().then(({ stashes }) => {
    dispatch(updateStashList(stashes))
  })
}

export const GIT_SELECT_STASH = 'GIT_SELECT_STASH'
export const selectStash = createAction(GIT_SELECT_STASH)

export function dropStash (stashRef, all) {
  return dispatch => api.gitDropStash(stashRef, all).then(res => {
    dispatch(notify({
      message: 'Drop stash success.',
    }))
    getStashList()(dispatch)
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Drop stash error.',
    }))
  })
}

export function applyStash ({stashRef, pop, applyIndex}) {
  return dispatch => api.gitApplyStash({stashRef, pop, applyIndex}).then(res => {
    dispatch(notify({
      message: 'Apply stash success.',
    }))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Apply stash error.',
    }))
  })
}

export function checkoutStash ({stashRef, branch}) {
  return dispatch => api.gitCheckoutStash({stashRef, branch}).then(res => {
    dispatch(notify({
      message: 'Checkout stash success.',
    }))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Checkout stash error.',
    }))
  })
}

export function getCurrentBranch (showSuccess) {
  return dispatch => api.gitCurrentBranch().then(({ name }) => {
    dispatch(updateCurrentBranch({name}))
    if (showSuccess) dispatch(notify({ message: 'sync success '}))
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Get current branch error.',
    }))
  })
}

export function resetHead ({ref, resetType}) {
  return dispatch => api.gitResetHead({ref, resetType}).then(res => {
    dispatch(notify({
      message: 'Reset success.',
    }))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Reset error.',
    }))
  })
}

export function addTag ({tagName, ref, message, force}) {
  return dispatch => api.gitAddTag({tagName, ref, message, force}).then(res => {
    dispatch(notify({message: 'Add tag success.'}))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Add tag error: ${res.msg}`,
    }))
  })
}

export function mergeBranch (branch) {
  return dispatch => api.gitMerge(branch).then(res => {
    dispatch(notify({message: 'Merge success.'}))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Merge error: ${res.msg}`,
    }))
  })
}

export function newBranch (branch) {
  return dispatch => api.gitNewBranch(branch).then(res => {
    dispatch(notify({message: 'Create new branch success.'}))
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Create new branch error: ${res.msg}`,
    }))
  })
}

export const GIT_STATUS_FOLD_NODE = 'GIT_STATUS_FOLD_NODE'
export const toggleNodeFold = createAction(GIT_STATUS_FOLD_NODE,
  (node, shouldBeFolded = null, deep = false) => {
    let isFolded = (typeof shouldBeFolded === 'boolean') ? shouldBeFolded : !node.isFolded
    return {node, isFolded, deep}
  }
)

export const GIT_STATUS_SELECT_NODE = 'GIT_STATUS_SELECT_NODE'
export const selectNode = createAction(GIT_STATUS_SELECT_NODE, node => node)

export const GIT_STATUS_STAGE_NODE = 'GIT_STATUS_STAGE_NODE'
export const toggleStaging = createAction(GIT_STATUS_STAGE_NODE, node => node)

export const GIT_MERGE = 'GIT_MERGE'
export const gitMerge = createAction(GIT_MERGE)
export function mergeFile (path) {
  return dispatch => dispatch(addModal('GitMergeFile', {path}  ))
}

export const GIT_DIFF = 'GIT_DIFF'
export const gitDiff = createAction(GIT_DIFF)
export function diffFile ({ path, newRef, oldRef }) {
  return dispatch => dispatch(addModal('GitDiffFile', { path, newRef, oldRef }))
}

export function gitFileDiff ({ path, newRef, oldRef }) {
  return dispatch => api.gitFileDiff({ path, newRef, oldRef })
}

export function getConflicts ({ path }) {
  return dispatch => api.gitConflicts({ path })
}

export function gitReadFile ({ref, path}) {
  return dispatch => api.gitReadFile({ref, path})
}

export function readFile ({path}) {
  return dispatch => api.readFile(path)
}

export function resolveConflict ({path, content}) {
  return dispatch => api.gitResolveConflict({path, content}).then(res => {
    dispatch(notify({
      message: 'Resolve conflict success.',
    }))
    dispatch(dismissModal())
    dispatch(updateModal({isInvalid: true}))
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Resolve conflict error.',
    }))
  })
}

export function cancelConflict ({path}) {
  return dispatch => api.gitCancelConflict({path}).then(res => {
    dispatch(dismissModal())
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Cancel conflict error: ' + res.msg,
    }))
  })
}

export function rebase ({branch, upstream, interactive, preserve}) {
  return dispatch => api.gitRebase({branch, upstream, interactive, preserve}).then(res => {
    if (res.success) {
      dispatch(notify({
        message: 'Rebase success.',
      }))
      dispatch(dismissModal())
    } else {
      dispatch(dismissModal())
      resolveRebase(res, dispatch)
    }
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Rebase error: ' + res.msg,
    }))
  })
}

function resolveRebase (data, dispatch) {
  if (data.status === 'STOPPED') {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Rebase STOPPED',
    }))
    api.gitStatus().then(({files, clean}) => {
      dispatch(updateStatus({files, isClean: clean}))
    }).then(() =>
      dispatch(showModal('GitResolveConflicts'))
    )
  } else if (data.status === 'INTERACTIVE_EDIT') {
    // AppActions.openRebaseInput(data.message)
    dispatch(showModal('GitRebaseInput'))
  } else if (data.status === 'ABORTED') {
    dispatch(notify({
      message: 'Rebase aborted.',
    }))
  } else if (data.status === 'INTERACTIVE_PREPARED') {
    let rebaseTodoLines = data.rebaseTodoLines
    dispatch(showModal('GitRebasePrepare', rebaseTodoLines))
  }
}

// export const GIT_STATUS = 'GIT_STATUS'
export function gitGetStatus (status) {
  return (dispatch) => {
    dispatch(updateModal({isInvalid: false}))
    api.gitStatus().then(({files, clean}) => {
      if (status) {
        files =  _.filter(files, (file) => {
          return file.status == status
        })
      }
      dispatch(updateStatus({files, isClean: clean}))
    }
  )}
}

export const GIT_REBASE_STATE = 'GIT_REBASE_STATE'
export function getRebaseState () {
  return (dispatch) => api.gitRebaseState().then(data => {
    dispatch(createAction(GIT_REBASE_STATE)(data))
  })
}

export function gitRebaseOperate ({operation, message}) {
  return dispatch => api.gitRebaseOperate({operation, message}).then(res => {
    if (res.success) {
      dispatch(notify({
        message: 'Operate success.',
      }))
    } else {
      resolveRebase(res, dispatch)
    }
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Operate error: ' + res.msg,
    }))
  })
}

export function gitRebaseUpdate (lines) {
  return dispatch => api.gitRebaseUpdate(lines).then(res => {
    if (res.success) {
      dispatch(notify({
        message: 'Rebase success.',
      }))
      dispatch(dismissModal())
    } else {
      dispatch(dismissModal())
      resolveRebase(res, dispatch)
    }
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Rebase error: ' + res.msg,
    }))
  })
}

export const GIT_COMMIT_DIFF = 'GIT_COMMIT_DIFF'
export const updateCommitDiff = createAction(GIT_COMMIT_DIFF)
export function gitCommitDiff ({rev, title, oldRef}) {
  return dispatch => api.gitCommitDiff({rev}).then(res => {
    let files = res.map(item => {
      let file = {
        status: item.changeType,
        name: item.newPath,
        oldPath: item.newPath
      }
      return file
    })
    dispatch(updateCommitDiff({files: files, ref: rev, title, oldRef}))
    dispatch(addModal('GitCommitDiff'))
  }).catch(res => {
    dispatch(notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Get commit diff error: ' + res.msg,
    }))
  })
}

export const SWITCH_VERSION = 'SWITCH_VERSION'
export function switchVersion () {
  return dispatch => api.switchVersion()
}
