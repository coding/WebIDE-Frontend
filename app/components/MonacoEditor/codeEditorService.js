import { toDefinition } from 'components/MonacoEditor/actions'

class CodeEditorService {
  constructor () {
    this._codeEditors = Object.create(null)
    this._diffEditors = Object.create(null)
  }

  addCodeEditor (editor) {
    this._codeEditors[editor.getId()] = editor
  }

  removeCodeEditor (editor) {
    delete this._codeEditors[editor.getId()]
  }

  listCodeEditors () {
    return Object.keys(this._codeEditors).map(id => this._codeEditors[id])
  }

  addDiffEditor (editor) {
    this._diffEditors[editor.getId()] = editor
  }

  removeDiffEditor (editor) {
    delete this._diffEditors[editor.getId()]
  }

  listDiffEditors () {
    return Object.keys(this._diffEditors).map(id => this._diffEditors[id])
  }

  getFocusedCodeEditor () {
    let editorWithWidgetFocus = null

    const editors = this.listCodeEditors()
    for (let i = 0; i < editors.length; i++) {
      const editor = editors[i]

      if (editor.hasTextFocus()) {
        // bingo!
        return editor
      }

      if (editor.hasWidgetFocus()) {
        editorWithWidgetFocus = editor
      }
    }

    return editorWithWidgetFocus
  }

  doOpenEditor (editor, input) {
    return editor
  }

  openCodeEditor (input, source) {
    toDefinition(input)
    const editor = this.doOpenEditor(source, input)
    return monaco.Promise.as(editor)
  }
}

export default new CodeEditorService()
