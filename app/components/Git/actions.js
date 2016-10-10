/* @flow weak */
import api from '../../api'
import { notify } from '../Notification/actions'
import { dismissModal } from '../Modal/actions'

export const GIT_STATUS = 'GIT_STATUS'
export function updateStatus ({files, isClean}) {
  return {
    type: GIT_STATUS,
    files,
    isClean
  }
}

export const GIT_UPDATE_COMMIT_MESSAGE = 'GIT_UPDATE_COMMIT_MESSAGE'
export function updateCommitMessage (commitMessage) {
  return {
    type: GIT_UPDATE_COMMIT_MESSAGE,
    commitMessage
  }
}

export function commit ({files, commitMessage: message}) {
  return dispatch => api.gitCommit({files, message}).then(filetreeDelta => {
    dispatch(notify({message: 'Git commit success.'}))
    dispatch(dismissModal())
  })
}

export const GIT_STAGE_FILE = 'GIT_STAGE_FILE'
export function stageFile (file) {
  return {
    type: GIT_STAGE_FILE,
    fileName: file.name
  }
}

export const GIT_UNSTAGE_FILE = 'GIT_UNSTAGE_FILE'
export function unstageFile (file) {
  return {
    type: GIT_UNSTAGE_FILE,
    fileName: file.name
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
        branches: data
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
