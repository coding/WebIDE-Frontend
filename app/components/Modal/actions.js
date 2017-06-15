import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'
import _ from 'lodash'

export const MODAL_SHOW = 'MODAL_SHOW'
export const showModal = promiseActionMixin(
  createAction(MODAL_SHOW, (modalConfig, content) => {
    switch (typeof modalConfig) {
      case 'object':
        return { ...modalConfig, id: _.uniqueId() }
      case 'string':
        return { type: modalConfig, id: _.uniqueId(), content }
      default:
        return { type: '' }
    }
  })
)

export const MODAL_ADD = 'MODAL_ADD'
export const addModal = promiseActionMixin(
  createAction(MODAL_ADD, (modalConfig, content) => {
    switch (typeof modalConfig) {
      case 'object':
        return { ...modalConfig, id: _.uniqueId() }
      case 'string':
        return { type: modalConfig, id: _.uniqueId(), content }
      default:
        return { type: '' }
    }
  })
)

export const MODAL_DISMISS = 'MODAL_DISMISS'
export const dismissModal = createAction(MODAL_DISMISS)

export const MODAL_UPDATE = 'MODAL_UPDATE'
export const updateModal = promiseActionMixin(
  createAction(MODAL_UPDATE, content => ({ content }))
)
