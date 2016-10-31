/* @flow weak */
import {
  WORKSPACE_FETCH_PUBLIC_KEY,
  WORKSPACE_FETCH_LIST,
  WORKSPACE_OPEN,
  WORKSPACE_CREATING,
  WORKSPACE_CREATING_ERROR
} from './actions'

const defaultState = {
  selectingWorkspace: true,
  workspaces: [],
  currentWorkspace: null,
  publicKey: null,
  fingerprint: null,
  isCreating: false,
  errMsg: null
}

export default function (state = defaultState, action) {
  switch (action.type) {
    case WORKSPACE_FETCH_PUBLIC_KEY:
      return {...state, publicKey: action.publicKey, fingerprint: action.fingerprint}

    case WORKSPACE_FETCH_LIST:
      return {...state, workspaces: action.workspaces}

    case WORKSPACE_OPEN:
      return {...state,
        selectingWorkspace: false,
        currentWorkspace: action.currentWorkspace
      }

    case WORKSPACE_CREATING:
      return {...state, isCreating: action.isCreating}

    case WORKSPACE_CREATING_ERROR:
      return {...state, isCreating: false, errMsg: action.msg}

    default:
      return state
  }
}
