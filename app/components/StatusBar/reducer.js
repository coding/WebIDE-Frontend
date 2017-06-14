/* @flow weak */
import { handleActions } from 'redux-actions'
import { UPDATE_UPLOAD_PROGRESS } from './actions'

export default handleActions({
  [UPDATE_UPLOAD_PROGRESS]: (state, action) => ({
    ...state,
    uploadProgress: action.payload ? `${action.payload}%` : ''
  }),
}, { uploadProgress: '' })
