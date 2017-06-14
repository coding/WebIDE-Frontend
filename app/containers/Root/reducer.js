import { handleActions } from 'redux-actions'
import { qs } from 'utils'
import config from '../../config'

import {
  INIT_STATE,
} from './actions'


export default handleActions({
  [INIT_STATE]: (state, action) => {
    const { spaceKey } = qs.parse(window.location.hash.slice(1))
    if (spaceKey) config.spaceKey = spaceKey
    return ({
      ...state,
    })
  }
})
