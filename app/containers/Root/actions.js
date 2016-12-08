/* @flow weak */
// import { createAction } from 'redux-actions'
import config from '../../config'
import { fetchExtensionByName } from '../../components/Extensions/actions'

// initAppState
export const INIT_STATE = 'INIT_STATE'
// export const GET_REMOTE_STATE = 'GET_REMOTE_STATE'
export const GET_REQUIRED_EXTENSIONS = 'GET_REQUIRED_EXTENSIONS'

export const initState = () => (dispatch) => {
  // get extension by config name
  const { requiredExtensions = [] } = config
  requiredExtensions.forEach(name => {
    dispatch(fetchExtensionByName(name))
  })
  return ({
    type: INIT_STATE
  })
}
