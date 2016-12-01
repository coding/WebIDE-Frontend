/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  FETCH_EXTENSIONS_LISTS_SUCCESS,
  INSTALL_LOCAL_EXTENSION,
  UNINSTALL_LOCAL_EXTENSION
} from './actions'

const defaultState = {
  localExtensions: {},
  remoteExtensions: {}
}

export default handleActions({
  [FETCH_EXTENSIONS_LISTS_SUCCESS]: (state, { data }) => ({
    ...state,
    remoteExtensions: data
  }),
  [INSTALL_LOCAL_EXTENSION]: (state, { name, data }) => ({
    ...state,
    localExtensions: { ...state.localExtensions, [name]: data }
  }),
  [UNINSTALL_LOCAL_EXTENSION]: (state, { name }) => {
    delete state.localExtensions[name]
    return state
  }
}, defaultState)
