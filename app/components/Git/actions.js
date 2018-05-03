import _ from 'lodash'
import api from '../../backendAPI'
import { notify, NOTIFY_TYPE } from '../Notification/actions'
import { showModal, addModal, dismissModal, updateModal } from '../Modal/actions'
import { createAction } from 'redux-actions'

import Clipboard from 'clipboard'
import i18n from 'utils/createI18n'

export const GIT_STATUS = 'GIT_STATUS'
export const updateStatus = createAction(GIT_STATUS)

export const GIT_UPDATE_COMMIT_MESSAGE = 'GIT_UPDATE_COMMIT_MESSAGE'
export const updateCommitMessage = createAction(GIT_UPDATE_COMMIT_MESSAGE)

export function commit () {
  return (dispatch, getState) => {
    const GitState = getState().GitState
    const stagedFiles = GitState.statusFiles.filter(file => file.isStaged)
    const stagedFilesPathList = stagedFiles.toArray().map(stagedFile => stagedFile.path.replace(/^\//, ''))
    const initialCommitMessage = i18n.get('git.commitView.initMessage')
    console.log(GitState.commitMessage);
    return api.gitCommit({
      files: stagedFilesPathList,
      message: GitState.commitMessage || initialCommitMessage,
    }).then((filetreeDelta) => {
      dispatch(updateCommitMessage(''))
      notify({ message: i18n`git.action.commitSuccess` })
      dismissModal()
    })
  }
}

export function updateStagingArea (action, file) {
  if (action == 'stage') {
    return stageFile(file)
  }
  return unstageFile(file)
}
export const GIT_FETCH = 'GIT_FETCH'
export function getFetch () {
  return dispatch => api.gitFetch().then(
     notify({ message: i18n`git.action.fetchSuccess` })
  )
}

export const GIT_BRANCH = 'GIT_BRANCH'
export function getBranches () {
  return dispatch => api.gitGetBranches().then((data) => {
    data.local = data.local.filter(item => item != 'HEAD')
    data.remote = data.remote.filter(item => item != 'HEAD')
    dispatch(createAction(GIT_BRANCH)({ branches: data }))
  })
}

export const GIT_CHECKOUT = 'GIT_CHECKOUT'
export const GIT_CHECKOUT_FAILED = 'GIT_CHECKOUT_FAILED'
export function checkoutBranch (branch, remoteBranch) {
  return (dispatch) => {
    api.gitCheckout(branch, remoteBranch).then((data) => {
      if (data.status === 'OK') {
        // 完全由 ws 里的 checkout 事件来改变显示
        // dispatch(createAction(GIT_CHECKOUT)({ branch }))
        notify({ message: i18n`git.action.checkoutBranch${branch}` })
      } else if (data.status === 'CONFLICTS') {
        dispatch(createAction(GIT_CHECKOUT_FAILED)({ branch }))
        notify({
          notifyType: NOTIFY_TYPE.ERROR,
          message: i18n`git.action.checkoutConflictsWarning`,
        })

        api.gitStatus().then(({ files, clean }) => {
          files = files.map((file) => {
            if (data.conflictList.find(f => (
              f === file.name
            ))) {
              file.status = 'CONFLICTION'
            }
            return file
          })
          dispatch(updateStatus({ files, isClean: clean }))
        }).then(() =>
          dispatch(showModal({
            type: 'GitCheckoutStash',
            title: i18n`git.action.checkoutFailed`
          }))
        )
        // const files = []
        // data.conflictList.map((file) => {
        //   files.push({name: file, status: 'CONFLICTION'})
        // })
        // dispatch(updateStatus({files, isClean: false}))
        // showModal('GitResolveConflicts')
      } else if (data.status === 'NONDELETED') {
        notify({
          notifyType: NOTIFY_TYPE.ERROR,
          message: i18n`git.action.checkoutFailedWithoutDeleted`,
        })
        const files = []
        data.undeletedList.map((file) => {
          files.push({ name: file, status: 'ADDED' })
        })
        dispatch(updateStatus({ files, isClean: false }))
        showModal({ type: 'GitResolveConflicts', title: i18n`git.action.checkoutNotDeleted`, disableClick: true })
      } else {
        notify({
          notifyType: NOTIFY_TYPE.ERROR,
          message: i18n`An Exception occurred during checkout, status: ${{ status: data.status }}`,
        })
      }
    })
  }
}

export const GIT_DELETE_BRANCH = 'GIT_DELETE_BRANCH'
export function gitDeleteBranch (branch) {
  return (dispatch) => {
    api.gitDeleteBranch(branch).then(() => {
      notify({ message: i18n`git.action.deletedSuccess${branch}` })
    })
  }
}

export const GIT_TAGS = 'GIT_TAGS'
export function getTags () {
  return dispatch => api.gitTags().then((data) => {
    dispatch(createAction(GIT_TAGS)({ tags: data }))
  })
}

export function pull () {
  return (dispatch) => {
    api.gitPull().then((res) => {
      notify({ message: 'Git pull success.' })
    }).catch((res) => {
      notify({ message: `Git pull fail: ${res.response.data.msg}` })
    })
  }
}

export function push () {
  return (dispatch) => {
    api.gitPushAll().then((res) => {
      notify({ message: 'Git push success.' })
    }).catch((res) => {
      notify({ message: `Git push fail: ${res.response.data.msg}` })
    })
  }
}

export const GIT_CURRENT_BRANCH = 'GIT_CURRENT_BRANCH'
export const updateCurrentBranch = createAction(GIT_CURRENT_BRANCH)

export const GIT_UPDATE_STASH_MESSAGE = 'GIT_UPDATE_STASH_MESSAGE'
export const updateStashMessage = createAction(GIT_UPDATE_STASH_MESSAGE)

export function createStash (message) {
  return (dispatch, getState) => api.gitCreateStash(message).then((res) => {
    notify({ message: 'Git stash success.' })
    dismissModal()
    const GitState = getState().GitState
    if (GitState.branches.failed) {
      dispatch(checkoutBranch(GitState.branches.failed))
      dispatch(createAction(GIT_CHECKOUT_FAILED)({ branch: '' }))
    }
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: err.msg,
    })
    dismissModal()
  })
}

export function showStash () {
  return (dispatch) => {
    dispatch(getCurrentBranch()).then(() =>
      showModal('GitStash')
    )
  }
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
  return dispatch => api.gitStashList().then(({ stashes }) => {
    dispatch(updateStashList(stashes))
  })
}

export const GIT_SELECT_STASH = 'GIT_SELECT_STASH'
export const selectStash = createAction(GIT_SELECT_STASH)

export function dropStash (stashRef, all) {
  return dispatch => api.gitDropStash(stashRef, all).then((res) => {
    notify({ message: 'Drop stash success.' })
    getStashList()(dispatch)
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Drop stash error.',
    })
  })
}

export function applyStash ({ stashRef, pop, applyIndex }) {
  return dispatch => api.gitApplyStash({ stashRef, pop, applyIndex }).then((res) => {
    notify({ message: 'Apply stash success.' })
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Apply stash error.',
    })
  })
}

export function checkoutStash ({ stashRef, branch }) {
  return dispatch => api.gitCheckoutStash({ stashRef, branch }).then((res) => {
    notify({ message: 'Checkout stash success.' })
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Checkout stash error.',
    })
  })
}

export function getCurrentBranch (showSuccess) {
  return dispatch => api.gitCurrentBranch().then(({ name }) => {
    dispatch(updateCurrentBranch({ name }))
    if (showSuccess) notify({ message: 'sync success' })
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Get current branch error.',
    })
  })
}

export function resetHead ({ ref, resetType }) {
  return dispatch => api.gitResetHead({ ref, resetType }).then((res) => {
    notify({ message: 'Reset success.' })
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Reset error.',
    })
  })
}

export function addTag ({ tagName, ref, message, force }) {
  return dispatch => api.gitAddTag({ tagName, ref, message, force }).then((res) => {
    notify({ message: 'Add tag success.' })
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Add tag error: ${err.msg}`,
    })
  })
}

export function mergeBranch (branch) {
  return dispatch => api.gitMerge(branch).then((res) => {
    // Merge conflict 的情况也是 200 OK，但 sucecss:false
    if (!res.success) return res
    notify({ message: 'Merge success.' })
    dismissModal()
  }).then((res) => {
    if (res.status && res.status === 'CONFLICTING') {
      dismissModal()
      api.gitStatus().then(({ files, clean }) => {
        files = _.filter(files, file => file.status == 'CONFLICTION')
        dispatch(updateStatus({ files, isClean: clean }))
      }).then(() =>
        showModal('GitResolveConflicts')
      )
    }
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Merge error: ${err.msg}`,
    })
  })
}

export function newBranch (branch) {
  return dispatch => api.gitNewBranch(branch).then((res) => {
    notify({ message: 'Create new branch success.' })
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Create new branch error: ${err.msg}`,
    })
  })
}

export const GIT_STATUS_FOLD_NODE = 'GIT_STATUS_FOLD_NODE'
export const toggleNodeFold = createAction(GIT_STATUS_FOLD_NODE,
  (node, shouldBeFolded = null, deep = false) => {
    const isFolded = (typeof shouldBeFolded === 'boolean') ? shouldBeFolded : !node.isFolded
    return { node, isFolded, deep }
  }
)

export const GIT_STATUS_SELECT_NODE = 'GIT_STATUS_SELECT_NODE'
export const selectNode = createAction(GIT_STATUS_SELECT_NODE, node => node)

export const GIT_STATUS_STAGE_NODE = 'GIT_STATUS_STAGE_NODE'
export const toggleStaging = createAction(GIT_STATUS_STAGE_NODE, node => node)

export const GIT_MERGE = 'GIT_MERGE'
export const gitMerge = createAction(GIT_MERGE)
export function mergeFile (path) {
  return dispatch => addModal('GitMergeFile', { path })
}

export const GIT_DIFF = 'GIT_DIFF'
export const gitDiff = createAction(GIT_DIFF)
export function diffFile ({ path, newRef, oldRef }) {
  return dispatch => addModal('GitDiffFile', { path, newRef, oldRef })
}

export function gitFileDiff ({ path, newRef, oldRef }) {
  return dispatch => api.gitFileDiff({ path, newRef, oldRef })
}

export function getConflicts ({ path }) {
  return dispatch => api.gitConflicts({ path })
}

export function gitReadFile ({ ref, path }) {
  return dispatch => api.gitReadFile({ ref, path })
}

export function readFile ({ path }) {
  return dispatch => api.readFile(path)
}

export function resolveConflict ({ path, content }) {
  return dispatch => api.gitResolveConflict({ path, content }).then((res) => {
    notify({
      message: 'Resolve conflict success.',
    })
    dismissModal()
    updateModal({ isInvalid: true })
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Resolve conflict error.',
    })
  })
}

export function cancelConflict ({ path }) {
  return dispatch => api.gitCancelConflict({ path }).then((res) => {
    dismissModal()
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Cancel conflict error: ${err.msg}`,
    })
  })
}

export function rebase ({ branch, upstream, interactive, preserve }) {
  return dispatch => api.gitRebase({ branch, upstream, interactive, preserve }).then((res) => {
    if (res.success) {
      notify({ message: 'Rebase success.' })
      dismissModal()
    } else {
      dismissModal()
      resolveRebase(res, dispatch)
    }
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Rebase error: ${err.msg}`,
    })
  })
}

function resolveRebase (data, dispatch) {
  if (data.status === 'STOPPED') {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: 'Rebase STOPPED',
    })
    api.gitStatus().then(({ files, clean }) => {
      dispatch(updateStatus({ files, isClean: clean }))
    }).then(() =>
      showModal('GitResolveConflicts')
    )
  } else if (data.status === 'INTERACTIVE_EDIT') {
    showModal('GitRebaseInput', data.message)
  } else if (data.status === 'ABORTED') {
    notify({
      message: 'Rebase aborted.',
    })
  } else if (data.status === 'INTERACTIVE_PREPARED') {
    const rebaseTodoLines = data.rebaseTodoLines
    showModal('GitRebasePrepare', rebaseTodoLines)
  } else if (data.status === 'UNCOMMITTED_CHANGES') {
    notify({
      message: 'Cannot rebase: Your index contains uncommitted changes. Please commit or stash them.',
    })
  } else if (data.status === 'EDIT') {
    notify({
      message: 'Current status is EDIT, we have stopped rebasing for you. \nPlease edit your files and then continue rebasing.',
    })
  }
}

// export const GIT_STATUS = 'GIT_STATUS'
export function gitGetStatus (status) {
  return (dispatch) => {
    updateModal({ isInvalid: false })
    api.gitStatus().then(({ files, clean }) => {
      if (status) {
        files = _.filter(files, file => file.status == status)
      }
      dispatch(updateStatus({ files, isClean: clean }))
    })
  }
}

export const GIT_REBASE_STATE = 'GIT_REBASE_STATE'
export function getRebaseState () {
  return dispatch => api.gitRebaseState().then((data) => {
    dispatch(createAction(GIT_REBASE_STATE)(data))
  })
}

export function gitRebaseOperate ({ operation, message }) {
  return dispatch => api.gitRebaseOperate({ operation, message }).then((res) => {
    if (res.success) {
      notify({
        message: 'Operate success.',
      })
    } else {
      resolveRebase(res, dispatch)
    }
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Operate error: ${err.msg}`,
    })
  })
}

export function gitRebaseUpdate (lines) {
  return dispatch => api.gitRebaseUpdate(lines).then((res) => {
    if (res.success) {
      notify({
        message: 'Rebase success.',
      })
      dismissModal()
    } else {
      dismissModal()
      resolveRebase(res, dispatch)
    }
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Rebase error: ${err.msg}`,
    })
  })
}

export const GIT_COMMIT_DIFF = 'GIT_COMMIT_DIFF'
export const updateCommitDiff = createAction(GIT_COMMIT_DIFF)
export function gitCommitDiff ({ rev, title, oldRef }) {
  return dispatch => api.gitCommitDiff({ rev }).then((res) => {
    const files = res.map((item) => {
      let file = {}
      if (item.newPath === '/dev/null') {
        file = {
          status: item.changeType,
          name: item.oldPath,
          oldPath: item.oldPath
        }
      } else {
        file = {
          status: item.changeType,
          name: item.newPath,
          oldPath: item.newPath
        }
      }
      return file
    })
    dispatch(updateCommitDiff({ files, ref: rev, title, oldRef }))
    addModal('GitCommitDiff')
  }).catch((err) => {
    notify({
      notifyType: NOTIFY_TYPE.ERROR,
      message: `Get commit diff error: ${err.msg}`,
    })
  })
}

export const GIT_HISTORY = 'GIT_HISTORY'
export const updateHistory = createAction(GIT_HISTORY)
export const fetchHistory = ({ path, page, size, reset }) => (dispatch) => {
  api.gitHistory({ path, page, size }).then((res) => {
    dispatch(updateHistory({ reset, res }))
  })
}

export const GIT_HISTORY_CONTEXT_MENU_OPEN = 'GIT_HISTORY_CONTEXT_MENU_OPEN'
export const openContextMenu = createAction(GIT_HISTORY_CONTEXT_MENU_OPEN, (e, node) => {
  e.stopPropagation()
  e.preventDefault()
  setTimeout(() => {
    new Clipboard('.clipboard', {
      text: trigger => node.name
    })
  }, 0)

  return {
    isActive: true,
    pos: { x: e.clientX, y: e.clientY },
    contextNode: node,
  }
})

export const GIT_HISTORY_CONTEXT_MENU_CLOSE = 'GIT_HISTORY_CONTEXT_MENU_CLOSE'
export const closeContextMenu = createAction(GIT_HISTORY_CONTEXT_MENU_CLOSE)
