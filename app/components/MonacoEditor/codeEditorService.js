import { toDefinition } from './actions'

export function createStyleSheet (container = document.getElementsByTagName('head')[0]) {
	const style = document.createElement('style')
	style.type = 'text/css'
	style.media = 'screen'
	container.appendChild(style)
	return style
}

class CodeEditorService {
  constructor () {
    this._codeEditors = Object.create(null)
    this._diffEditors = Object.create(null)
    this._decorationOptionProviders = Object.create(null)
    this._styleSheet = createStyleSheet()
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

  registerDecorationType (key, options, parentTypeKey) {
    let provider = this._decorationOptionProviders[key]
    if (!provider) {
      const providerArags = {
        styleSheet: this._styleSheet,
        key,
        parentTypeKey,
        options: options || Object.create(null)
      }
      if (!parentTypeKey) {
      } else {
      }
    }
  }

  resolveDecorationOptions (key, is) {
    return {}
  }

  doOpenEditor (editor, input) {
    return editor
  }

  openCodeEditor (input, source) {
    toDefinition(input)
    const editor = this.doOpenEditor(source, input)
    return monaco.Promise.as(null)
  }
}

export default new CodeEditorService()
