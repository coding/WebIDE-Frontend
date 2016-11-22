/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  EDITOR_RESIZE,
} from './actions'

const defaultState = {
  leftGrow: 50,
  rightGrow: 50,
  showBigSize: false,
  showPreview: false,
};

export default handleActions({
  [EDITOR_RESIZE]: (state, action) => {
    const { sectionId, dX, dY } = action.payload;
    const leftDom = document.getElementById('editor_preview_markdown_editor');
    const rightDom = document.getElementById('editor_preview_preview');
    return ({
      ...state,
      leftGrow: state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth,
      rightDom: state.rightDom * (rightDom.offsetWidth + dX) / rightDom.offsetWidth,
    });
  },
}, defaultState);