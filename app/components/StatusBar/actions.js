import { createAction } from 'redux-actions'

export const UPDATE_UPLOAD_PROGRESS = 'UPDATE_UPLOAD_PROGRESS'
export const updateUploadProgress = createAction(UPDATE_UPLOAD_PROGRESS, num => num)
