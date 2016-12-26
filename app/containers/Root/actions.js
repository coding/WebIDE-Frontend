/* @flow weak */
// import { createAction } from 'redux-actions'
import config from '../../config'
import { initializeFileTree } from '../../components/FileTree/actions'
import ide from '../../IDE'

// initAppState
export const INIT_STATE = 'INIT_STATE'
export const initState = () => (dispatch) => {
  window.ide = ide
  dispatch({ type: INIT_STATE })
  dispatch(initializeFileTree()) // @fixme: this is related to the quirk in filetree state
}
