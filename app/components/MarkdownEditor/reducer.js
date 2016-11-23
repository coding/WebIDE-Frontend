/* @flow weak */
import { handleActions } from 'redux-actions'

import {
  MARKDOWN_EDITOR_RESIZE,
  MARKDOWN_EDITOR_TOGGLE_PREVIEW,
  MARKDOWN_EDITOR_TOGGLE_SIZE
} from './actions'

const defaultState = {
  leftGrow: 50,
  rightGrow: 50,
  showBigSize: false,
  showPreview: true,
};

export default handleActions({
  [MARKDOWN_EDITOR_RESIZE]: (state, action) => {
    const { sectionId, dX, dY } = action.payload;
    const leftDom = document.getElementById('editor_preview_markdown_editor');
    const rightDom = document.getElementById('editor_preview_preview');
    return ({
      ...state,
      leftGrow: state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth,
      rightGrow: state.rightGrow * (rightDom.offsetWidth + dX) / rightDom.offsetWidth,
    });
  },
  [MARKDOWN_EDITOR_TOGGLE_PREVIEW]: (state, action) => {
    return ({
      ...state,
      showPreview: !state.showPreview,
    });
  },
  [MARKDOWN_EDITOR_TOGGLE_SIZE]: (state, action) => {
    return ({
      ...state,
      showBigSize: !state.showBigSize,
    });
  },
}, defaultState);
