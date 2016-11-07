/* @flow weak */
import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'

let modal_id = 0;

export const MODAL_SHOW = 'MODAL_SHOW'
export const showModal = promiseActionMixin(
  createAction(MODAL_SHOW, (modalType, content) => ({_id: modal_id++, modalType, content}))
)

export const MODAL_DISMISS = 'MODAL_DISMISS'
export const dismissModal = createAction(MODAL_DISMISS)

export const MODAL_UPDATE = 'MODAL_UPDATE'
export const updateModal = promiseActionMixin(
  createAction(MODAL_UPDATE, content => ({content}))
)
