import registerAction from 'utils/actions/registerAction'
// import state from './state'

export const MARKDOWN_EDITOR_RESIZE = 'EDITOR_RESIZE'
export const editorResize = registerAction(MARKDOWN_EDITOR_RESIZE,
  (__, dX, dY, state) => ({ dX, dY, state }),
  ({ dX, dY, state }) => {
    const leftDom = document.getElementById('editor_preview_markdown_editor')
    const rightDom = document.getElementById('editor_preview_preview')
    state.leftGrow = state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth
    state.rightGrow = state.rightGrow * (rightDom.offsetWidth + dX) / rightDom.offsetWidth
  }
)

export const MARKDOWN_EDITOR_TOGGLE_PREVIEW = 'MARKDOWN_EDITOR_TOGGLE_PREVIEW'
export const togglePreview = registerAction(MARKDOWN_EDITOR_TOGGLE_PREVIEW,
  ({ state }) => state.showPreview = !state.showPreview
)

export const MARKDOWN_EDITOR_TOGGLE_SIZE = 'MARKDOWN_EDITOR_TOGGLE_SIZE'
export const togglePreviewSize = registerAction(MARKDOWN_EDITOR_TOGGLE_SIZE,
  ({ state }) => state.showBigSize = !state.showBigSize
)
