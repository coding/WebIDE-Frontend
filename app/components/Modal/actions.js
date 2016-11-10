/* @flow weak */
import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'
import _ from 'lodash'

export const MODAL_SHOW = 'MODAL_SHOW'
export const showModal = promiseActionMixin(
  createAction(MODAL_SHOW, (modalType, content) => ({id: _.uniqueId(), modalType, content}))
)

export const MODAL_DISMISS = 'MODAL_DISMISS'
export const dismissModal = createAction(MODAL_DISMISS)

export const MODAL_UPDATE = 'MODAL_UPDATE'
export const updateModal = promiseActionMixin(
  createAction(MODAL_UPDATE, content => ({content}))
)
