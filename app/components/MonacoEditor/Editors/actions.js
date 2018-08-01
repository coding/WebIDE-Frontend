import registerAction from 'utils/actions/registerAction'
// import state from './state'

export const MARKDOWN_EDITOR_RESIZE_MONACO = 'EDITOR_RESIZE_MONACO'
export const editorResize = registerAction(MARKDOWN_EDITOR_RESIZE_MONACO,
  (__, dX, dY, state) => ({ dX, dY, state }),
  ({ dX, dY, state }) => {
    const leftDom = document.getElementById('editor_preview_markdown_editor')
    const rightDom = document.getElementById('editor_preview_preview')
    state.leftGrow = state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth
    state.rightGrow = state.rightGrow * (rightDom.offsetWidth + dX) / rightDom.offsetWidth
  }
)

const HTML_EDITOR_RESIZE_MONACO = 'HTML_EDITOR_RESIZE_MONACO'
export const htmlEditorResize = registerAction(HTML_EDITOR_RESIZE_MONACO,
  (__, dX, dY, state) => ({ dX, dY, state }),
  ({ dX, dY, state }) => {
    const leftDom = document.getElementById('editor_preview_html_editor')
    const rightDom = document.getElementById('editor_preview_html_preview')
    state.leftGrow = state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth
    state.rightGrow = state.rightGrow * (rightDom.offsetWidth + dX) / rightDom.offsetWidth
  }
)

export const MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO = 'MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO'
export const togglePreview = registerAction(MARKDOWN_EDITOR_TOGGLE_PREVIEW_MONACO,
  ({ state }) => state.showPreview = !state.showPreview
)

export const MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO = 'MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO'
export const togglePreviewSize = registerAction(MARKDOWN_EDITOR_TOGGLE_SIZE_MONACO,
  ({ state }) => {
    state.showBigSize = !state.showBigSize
  }
)
