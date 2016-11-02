/* @flow weak */
import api from '../../api'
import { notify, NOTIFY_TYPE } from '../Notification/actions'
import { showModal, dismissModal } from '../Modal/actions'
import { createAction } from 'redux-actions'

export const GIT_STATUS = 'GIT_STATUS'
export const updateStatus = createAction(GIT_STATUS)

export const GIT_UPDATE_COMMIT_MESSAGE = 'GIT_UPDATE_COMMIT_MESSAGE'
export const updateCommitMessage = createAction(GIT_UPDATE_COMMIT_MESSAGE)

export function commit ({files, commitMessage: message}) {
  return dispatch => api.gitCommit({files, message}).then(filetreeDelta => {
    dispatch(notify({message: 'Git commit success.'}))
    dispatch(dismissModal())
  })
}

export const GIT_STAGE_FILE = 'GIT_STAGE_FILE'
export const stageFile = createAction(GIT_STAGE_FILE)

export const GIT_UNSTAGE_FILE = 'GIT_UNSTAGE_FILE'
export const unstageFile = createAction(GIT_UNSTAGE_FILE)

export function updateStagingArea (action, file) {
  if (action == 'stage') {
    return stageFile(file)
  } else {
    return unstageFile(file)
  }
}

export const GIT_BRANCH = 'GIT_BRANCH'
export function getBranches () {
  return (dispatch) => {
    api.gitBranch().then(data => {
      dispatch(createAction(GIT_BRANCH)({ branches: data }))
    })
  }
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

export function pull () {
  return dispatch => {
    api.gitPull().then(res => {
      if (res === true)
        dispatch(notify({message: 'Git pull success.'}))
      else
        dispatch(notify({message: 'Git pull fail.' }))
    })
  }
}

export function push () {
  return dispatch => {
    api.gitPushAll().then(res => {
      if (res === true)
        dispatch(notify({message: 'Git push success.'}))
      else
        dispatch(notify({message: 'Git push fail.' }))
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

export function getCurrentBranch () {
  return dispatch => api.gitCurrentBranch().then(({ name }) => {
    dispatch(updateCurrentBranch({name}))
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
