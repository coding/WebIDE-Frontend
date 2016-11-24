/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  INIT_STATE,
} from './actions'

export default handleActions({
  [INIT_STATE]: (state) => {
    const stateFromStorage = localStorage.getItem('snapshot')
    const stateToObject = JSON.parse(stateFromStorage)
    if (!stateFromStorage) return state
    return ({
      ...state,
      SettingState: { ...state.SettingState, ...stateToObject }
    })
  }
})
