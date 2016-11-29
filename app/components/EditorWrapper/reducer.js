/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  EDITOR_RESIZE,
} from './actions'

const defaultState = {
  leftGrow: 1,
  rightGrow: 1,
  previewFullScreen: false,
  showPreview: false
};

export default handleActions({
  [EDITOR_RESIZE]: (state, action) => {
    const { sectionId, dX, dY } = action.payload;
    return state;
  }
}, defaultState);

