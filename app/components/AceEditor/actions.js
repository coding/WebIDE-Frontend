export const EDITOR_REGISTER = 'EDITOR_REGISTER'
export function registerEditor(id, editor, editorDOM) {
  return {
    type: EDITOR_REGISTER,
    id: id,
    editor: editor,
    editorDOM: editorDOM,
  }
}

export const EDITOR_RESIZE_ALL = 'EDITOR_RESIZE_ALL'
export function resizeAll() {
  return {
    type: EDITOR_RESIZE_ALL
  }
}
