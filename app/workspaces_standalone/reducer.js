import { handleActions } from 'redux-actions'
import {
  WORKSPACE_FETCH_PUBLIC_KEY,
  WORKSPACE_FETCH_LIST,
  WORKSPACE_OPEN,
  WORKSPACE_CREATING,
  WORKSPACE_CREATING_ERROR
} from './actions'

const defaultState = {
  route: 'WORKSPACES',
  workspaces: [],
  currentWorkspace: null,
  publicKey: null,
  fingerprint: null,
  isCreating: false,
  errMsg: null
}

export default handleActions({
  [WORKSPACE_FETCH_PUBLIC_KEY]: (state, action) => {
    const { publicKey, fingerprint } = action.payload
    return { ...state, publicKey, fingerprint }
  },

  [WORKSPACE_FETCH_LIST]: (state, action) => ({ ...state, workspaces: action.payload }),

  [WORKSPACE_OPEN]: (state, action) => ({ ...state, route: 'IDE', currentWorkspace: action.payload }),

  [WORKSPACE_CREATING]: (state, action) => ({ ...state, isCreating: action.payload }),

  [WORKSPACE_CREATING_ERROR]: (state, action) => ({ ...state, isCreating: false, errMsg: action.payload })
}, defaultState)
