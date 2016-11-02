/* @flow weak */
import api from '../../api'
import config from '../../config'

export const WORKSPACE_FETCH_PUBLIC_KEY = 'WORKSPACE_FETCH_PUBLIC_KEY'
export function fetchPublicKey () {
  return dispatch => {
    api.getPublicKey().then((result) =>
      dispatch({type: WORKSPACE_FETCH_PUBLIC_KEY, payload: result})
    )
  }
}

export const WORKSPACE_FETCH_LIST = 'WORKSPACE_FETCH_LIST'
export function fetchWorkspaceList () {
  return dispatch => {
    api.getWorkspaces().then(workspaces =>
      dispatch({type: WORKSPACE_FETCH_LIST, payload: workspaces})
    )
  }
}

export const WORKSPACE_OPEN = 'WORKSPACE_OPEN'
export function openWorkspace (workspace) {
  config.spaceKey = workspace.spaceKey
  config.projectName = workspace.projectName
  return {
    type: WORKSPACE_OPEN,
    payload: workspace
  }
}

export const WORKSPACE_CREATING = 'WORKSPACE_CREATING'
export function toggleCreatingWorkspace (isCreating) {
  return {type: WORKSPACE_CREATING, payload: isCreating}
}

export const WORKSPACE_CREATING_ERROR = 'WORKSPACE_CREATING_ERROR'
export function toggleCreatingWorkspaceErr (msg) {
  return {type: WORKSPACE_CREATING_ERROR, payload: msg}
}

export function createWorkspace (url) {
  return dispatch => {
    dispatch(toggleCreatingWorkspace(true))
    api.createWorkspace(url).then(ws => {
      dispatch(fetchWorkspaceList())
      dispatch(toggleCreatingWorkspace(false))
    }).catch(e => {
      dispatch(toggleCreatingWorkspaceErr(e.msg))
    })
  }
}

export function deleteWorkspace (spaceKey) {
  return dispatch => {
    api.deleteWorkspace(spaceKey).then(res =>
      dispatch(fetchWorkspaceList())
    ).catch(e => {
      dispatch(toggleCreatingWorkspaceErr(e.msg))
    })
  }
}
