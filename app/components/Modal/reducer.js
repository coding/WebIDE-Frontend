/* @flow weak */
import {
  MODAL_SHOW,
  MODAL_DISMISS,
  MODAL_UPDATE
} from './actions';

const _state = {
  isActive: false,
  showBackdrop: false,
  position: 'top',
};

export default function ModalReducer (state=_state, action) {
  switch (action.type) {

    case MODAL_SHOW:
      var newState = {
        isActive: true,
        modalType: action.payload.modalType,
        meta: action.meta,
        content: action.payload.content
      }
      return { ...state, ...newState }

    case MODAL_DISMISS:
      var newState = {
        isActive: false,
        content: null,
        modalType: null
      }
      return { ...state, ...newState }

    case MODAL_UPDATE:
      return {
        ...state,
        meta: action.meta,
        content: Object.assign({}, state.content, action.payload.content)
      }

    default:
      return state
  }
}
