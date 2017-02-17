/* @flow weak */
import { handleActions } from 'redux-actions'
import {
  MODAL_SHOW,
  MODAL_ADD,
  MODAL_DISMISS,
  MODAL_UPDATE
} from './actions'

const baseModal = {
  id: 0,
  isActive: false,
  showBackdrop: false,
  position: 'top'
}

const ModalReducer = handleActions({
  [MODAL_SHOW]: (state, {payload: modalConfig, meta}) => {
    let newModal = {
      ...baseModal,
      isActive: true,
      ...modalConfig,
      meta
    }
    return {
      ...state,
      stack: [newModal]
    }
  },

  [MODAL_ADD]: (state, {payload: modalConfig, meta}) => {
    let newModal = {
      ...baseModal,
      isActive: true,
      ...modalConfig,
      meta
    }
    return {
      ...state,
      stack: [...state.stack, newModal]
    }
  },

  [MODAL_DISMISS]: (state, action) => {
    return {
      ...state,
      stack: state.stack.slice(0, -1)
    }
  },

  [MODAL_UPDATE]: (state, action) => {
    let lastModal = state.stack.pop()
    if (lastModal) lastModal = {...lastModal, content: action.payload.content}
    return {
      ...state,
      stack: [...state.stack, lastModal]
    }
  }

}, {stack: []})

export default ModalReducer
