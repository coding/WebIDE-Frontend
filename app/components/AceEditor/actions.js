/* @flow weak */
import { createAction } from 'redux-actions'
export const EDITOR_REGISTER = 'EDITOR_REGISTER'
export const registerEditor = createAction(EDITOR_REGISTER,
  (id, editor, editorDOM) => ({ id, editor, editorDOM })
)

export const EDITOR_RESIZE_ALL = 'EDITOR_RESIZE_ALL'
export const resizeAll = createAction(EDITOR_RESIZE_ALL)
