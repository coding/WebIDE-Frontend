/* @flow weak */
import api from '../../api'
import { notify, NOTIFY_TYPE } from '../Notification/actions'
import { showModal, dismissModal } from '../Modal/actions'

export const GIT_STATUS = 'GIT_STATUS'
export function updateStatus (payload) {
  return {
    type: GIT_STATUS,
    payload
  }
}

export const GIT_UPDATE_COMMIT_MESSAGE = 'GIT_UPDATE_COMMIT_MESSAGE'
export function updateCommitMessage (payload) {
  return {
    type: GIT_UPDATE_COMMIT_MESSAGE,
    payload
  }
}

export function commit ({files, commitMessage: message}) {
  return dispatch => api.gitCommit({files, message}).then(filetreeDelta => {
    dispatch(notify({message: 'Git commit success.'}))
    dispatch(dismissModal())
  })
}

export const GIT_STAGE_FILE = 'GIT_STAGE_FILE'
export function stageFile (payload) {
  return {
    type: GIT_STAGE_FILE,
    payload
  }
}

export const GIT_UNSTAGE_FILE = 'GIT_UNSTAGE_FILE'
export function unstageFile (payload) {
  return {
    type: GIT_UNSTAGE_FILE,
    payload
  }
}

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
      dispatch({
        type: GIT_BRANCH,
        payload: { branches: data }
      })
    })
  }
}

export const GIT_CHECKOUT = 'GIT_CHECKOUT'
export function checkoutBranch (branch, remoteBranch) {
  return dispatch => {
    api.gitCheckout(branch, remoteBranch).then(data => {
      dispatch({type: GIT_CHECKOUT, branch})
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
export function updateCurrentBranch ({ name }) {
  return {
    type: GIT_CURRENT_BRANCH,
    payload: {branch: name},
  }
}

export const GIT_UPDATE_STASH_MESSAGE = 'GIT_UPDATE_STASH_MESSAGE'
export function updateStashMessage (payload) {
  return {
    type: GIT_UPDATE_STASH_MESSAGE,
    payload,
  }
}

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
export function updateStashList (payload) {
  return {
    type: GIT_UPDATE_STASH_LIST,
    payload
  }
}

export const GIT_UPDATE_UNSTASH_IS_POP = 'GIT_UPDATE_UNSTASH_IS_POP'
export function updateUnstashIsPop (payload) {
  return {
    type: GIT_UPDATE_UNSTASH_IS_POP,
    payload
  }
}

export const GIT_UPDATE_UNSTASH_IS_REINSTATE = 'GIT_UPDATE_UNSTASH_IS_REINSTATE'
export function updateUnstashIsReinstate (payload) {
  return {
    type: GIT_UPDATE_UNSTASH_IS_REINSTATE,
    payload
  }
}

export const GIT_UPDATE_UNSTASH_BRANCH_NAME = 'GIT_UPDATE_UNSTASH_BRANCH_NAME'
export function updateUnstashBranchName (payload) {
  return {
    type: GIT_UPDATE_UNSTASH_BRANCH_NAME,
    payload
  }
}

export function getStashList () {
  return (dispatch) => api.gitStashList().then(({ stashes }) => {
    dispatch(updateStashList(stashes))
  })
}

export const GIT_SELECT_STASH = 'GIT_SELECT_STASH'
export function selectStash (payload) {
  return {
    type: GIT_SELECT_STASH,
    payload
  }
}

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
