import {
  MODAL_SHOW,
  MODAL_DISMISS
} from './actions';

const _state = {
  isActive: false,
  showBackdrop: false,
  position: 'top',
};

export default function FileTreeReducer (state=_state, action) {
  switch (action.type) {

    case MODAL_SHOW:
      var newState = {
        isActive: true,
        content: action.content,
        modalType: action.modalType
      };
      return Object.assign({}, state, newState);

    case MODAL_DISMISS:
      var newState = {
        isActive: false,
        content: null,
        modalType: null
      };
      return Object.assign({}, state, newState);

    default:
      return state;
  }
}
