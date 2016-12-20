/* @flow weak */
// import { createAction } from 'redux-actions'
import config from '../../config'

// initAppState
export const INIT_STATE = 'INIT_STATE'
export const initState = () => (dispatch) => {
  dispatch({ type: INIT_STATE })
}
