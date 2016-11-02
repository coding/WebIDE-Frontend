/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import { EDITOR_REGISTER } from './actions'

let _state = {
  editors: [],
  theme: 'monokai'
}

function getEditorById (id) {
  return _.find(this.editors, {id: id})
}

class EditorStatesManager {
  constructor () {

  }
}

class EditorState {
  constructor (id, editor, editorDOM) {
    this.id = id
    this.editor = editor
    this.editorDOM = editorDOM
    this.editorDOM.$ace_editor = editor
  }

  // defaultConfig = {
  //   mode: '',
  //   theme: '',
  //   value: '',
  //   fontSize: 12,
  //   showGutter: true,
  //   minLines: null,
  //   maxLines: null,
  //   readOnly: false,
  //   highlightActiveLine: true,
  //   showPrintMargin: true,
  //   tabSize: 4,
  //   cursorStart: 1,
  //   editorProps: {},
  //   setOptions: {},
  //   wrapEnabled: false,
  //   enableBasicAutocompletion: false,
  //   enableLiveAutocompletion: false,
  // }

  setConfig (config) {
    const {mode, theme, fontSize} = config
    if (mode) this.editor.getSession().setMode(`ace/mode/${mode}`)
    if (theme) this.editor.setTheme(`ace/theme/${theme}`)
    if (fontSize) this.editor.setFontSize(fontSize)
  }

}

export default handleActions({
  [EDITOR_REGISTER]: (state, action) => {
    const {id, editor, editorDOM} = action.payload
    const editorState = new EditorState(id, editor, editorDOM)
    state.editors.push(editorState)
    return state
  }
}, _state)
