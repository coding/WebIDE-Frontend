/* @flow weak */
import {
  MODAL_SHOW,
  MODAL_DISMISS,
  MODAL_UPDATE
} from './actions'

const _state = {
  _id: 0,
  isActive: false,
  showBackdrop: false,
  position: 'top'
};

function modal(state = _state, action) {
  switch (action.type) {

    case MODAL_SHOW:
      return Object.assign({}, state, {
        _id: action.payload._id,
        isActive: true,
        modalType: action.payload.modalType,
        meta: action.meta,
        content: action.payload.content
      });


    case MODAL_DISMISS:
      return Object.assign({}, state, {
        isActive: false,
        content: null,
        modalType: null
      });

    case MODAL_UPDATE:
      if (state._id != action._id) {
        return state;
      }

      return {
        ...state,
        meta: action.meta,
        content: Object.assign({}, state.content, action.payload.content)
      };

    default:
      return state;
  }
}

export default function ModalsReducer(state = {stack: []}, action) {
  switch (action.type) {

    case MODAL_SHOW:
      return Object.assign({}, state, {
        stack: [
          ...state.stack,
          modal(undefined, action)
        ]
      });

    case MODAL_DISMISS:
      modal(state[state.length - 1], action);
      return Object.assign({}, state, {stack: state.stack.slice(0, -1)});

    case MODAL_UPDATE:
      return Object.assign({}, state, {
        stack: state.map(modal =>
          modal(modal, action)
        )
      });

    default:
      return state;
  }
}
