/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  FETCH_EXTENSIONS_LISTS_SUCCESS,
  INSTALL_LOCAL_EXTENSION,
  UNINSTALL_LOCAL_EXTENSION,
  UPDATE_EXTENSION_CACHE
} from './actions'

const defaultState = {
  localExtensions: {},
  remoteExtensions: {},
  cacheExtensions: {},
  extensionsState: {}
}

export default handleActions({
  // update cache
  [UPDATE_EXTENSION_CACHE]: (state) => {
    const cache = window.localStorage
    const cacheExtensions = Object.keys(cache)
    .filter(key => key.includes('extension'))
    .reduce((p, v) => {
      p[[v.split('_')[1]]] = cache[v]
      return p
    }, {})
    return ({ ...state, cacheExtensions })
  },
  [FETCH_EXTENSIONS_LISTS_SUCCESS]: (state, { payload: { data } }) => ({
    ...state,
    remoteExtensions: data
  }),
  [INSTALL_LOCAL_EXTENSION]: (state, { payload: { name = '', data = {} } = {} }) => ({
    ...state,
    localExtensions: { ...state.localExtensions, [name]: data }
  }),
  [UNINSTALL_LOCAL_EXTENSION]: (state, { payload: name }) => {
    const newState = Object.assign({}, state)
    delete newState.localExtensions[name]
    return { ...state, ...newState }
  }
}, defaultState)
