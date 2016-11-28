/* @flow weak */
import { createAction } from 'redux-actions'

export const INIT_STATE = 'INIT_STATE'
// export const GET_REMOTE_STATE = 'GET_REMOTE_STATE'
export const initState = createAction(INIT_STATE)
