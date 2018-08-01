import registerAction from 'utils/actions/registerAction'
// import state from './state'

const EDITOR_RESIZE_MONACO = 'EDITOR_RESIZE_MONACO';
export const editorResize = registerAction(EDITOR_RESIZE_MONACO,
  (dX, state, editorID, previewID) => ({ dX, state, editorID, previewID }),
  ({ dX, state, editorID, previewID }) => {
    const leftDom = document.getElementById(editorID);
    const leftWidth = leftDom ? leftDom.offsetWidth : 0;
    const rightDom = document.getElementById(previewID);
    const rightWidth = rightDom ? rightDom.offsetWidth : 0;
    let left = state.leftGrow * (leftWidth - dX) / leftWidth;
    if (Number.isNaN(left) || !Number.isFinite(left) || left <= 1) {
      left = 1;
      state.showBigSize = true;
      state.collapseAuto = true;
    } else if (left > 99) {
      left = 99;
    }
    state.leftGrow = left;
    let right = state.rightGrow * (rightWidth + dX) / rightWidth;
    if (Number.isNaN(right) || !Number.isFinite(right) || right <= 1) {
      right = 1;
      state.showPreview = false;
      state.collapseAuto = true;
    } else if (right > 99) {
      right = 99;
    }
    state.rightGrow = right;
  }
)

export const MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO = 'MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO'
export const togglePreview = registerAction(MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO,
  ({ state }) => {
    state.showPreview = !state.showPreview;
    if (state.collapseAuto) {
      state.leftGrow = 50;
      state.rightGrow = 50;
      state.collapseAuto = false;
    }
  }
)

export const MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO = 'MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO'
export const togglePreviewSize = registerAction(MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO,
  ({ state }) => {
    state.showBigSize = !state.showBigSize;
    if (state.collapseAuto) {
      state.leftGrow = 50;
      state.rightGrow = 50;
      state.collapseAuto = false;
    }
  }
)
