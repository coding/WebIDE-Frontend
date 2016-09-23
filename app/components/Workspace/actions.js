/* @flow weak */
import * as api from '../../api';
import config from '../../config';

export const WORKSPACE_FETCH_PUBLIC_KEY = 'WORKSPACE_FETCH_PUBLIC_KEY';
export function fetchPublicKey() {
  return dispatch => {
    api.getPublicKey().then( ({publicKey, fingerprint}) =>
      dispatch({type: WORKSPACE_FETCH_PUBLIC_KEY, publicKey, fingerprint})
    )
  };
}

export const WORKSPACE_FETCH_LIST = 'WORKSPACE_FETCH_LIST';
export function fetchWorkspaceList() {
  return dispatch => {
    api.getWorkspaces().then( workspaces =>
      dispatch({type: WORKSPACE_FETCH_LIST, workspaces})
    )
  };
}

export const WORKSPACE_OPEN = 'WORKSPACE_OPEN';
export function openWorkspace(workspace) {
  config.spaceKey = workspace.spaceKey;
  config.projectName = workspace.projectName;
  return {
    type: WORKSPACE_OPEN,
    currentWorkspace: workspace
  }
}


export const WORKSPACE_CREATING = 'WORKSPACE_CREATING';
export function toggleCreatingWorkspace(isCreating) {
  return {type: WORKSPACE_CREATING, isCreating}
}

export function createWorkspace(url) {
  return dispatch => {
    dispatch(toggleCreatingWorkspace(true));
    api.createWorkspace(url).then( ws => {
      dispatch(fetchWorkspaceList());
      dispatch(toggleCreatingWorkspace(false));
    })
  }
}

export function deleteWorkspace(spaceKey) {
  return dispatch => {
    api.deleteWorkspace(spaceKey).then(res =>
      dispatch(fetchWorkspaceList())
    )
  }
}
