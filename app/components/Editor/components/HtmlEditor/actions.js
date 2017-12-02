import registerAction from 'utils/actions/registerAction'
// import state from './state'

export const HTML_EDITOR_RESIZE = 'HTML_EDITOR_RESIZE'
export const editorResize = registerAction(HTML_EDITOR_RESIZE,
  (__, dX, dY, state) => ({ dX, dY, state }),
  ({ dX, dY, state }) => {
    const leftDom = document.getElementById('editor_preview_markdown_editor')
    const rightDom = document.getElementById('editor_html_preview')
    state.leftGrow = state.leftGrow * (leftDom.offsetWidth - dX) / leftDom.offsetWidth
    state.rightGrow = state.rightGrow * (rightDom.offsetWidth + dX) / rightDom.offsetWidth
  }
)

export const HTML_EDITOR_TOGGLE_PREVIEW = 'HTML_EDITOR_TOGGLE_PREVIEW'
export const togglePreview = registerAction(HTML_EDITOR_TOGGLE_PREVIEW,
  ({ state }) => state.showPreview = !state.showPreview
)

export const HTML_EDITOR_TOGGLE_SIZE = 'HTML_EDITOR_TOGGLE_SIZE'
export const togglePreviewSize = registerAction(HTML_EDITOR_TOGGLE_SIZE,
  ({ state }) => state.showBigSize = !state.showBigSize
)
