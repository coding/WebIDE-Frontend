/* @flow weak */
// import { createAction } from 'redux-actions'
import config from '../../config'
import { fetchExtensionByName } from '../../components/Extensions/actions'

// initAppState
export const INIT_STATE = 'INIT_STATE'

export const initState = () => (dispatch) => {
  // get extension by config name
  const { requiredExtensions = [] } = config
  requiredExtensions.forEach(name => {
    dispatch(fetchExtensionByName(name))
  })

  dispatch({ type: INIT_STATE })
}
