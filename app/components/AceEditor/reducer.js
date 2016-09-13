import _ from 'lodash';
import { EDITOR_REGISTER } from './actions';

let _state = {
  editors: [],
  theme: 'monokai'
};

function getEditorById (id) {
  return _.find(this.editors, {id: id})
}

class EditorStatesManager {
  constructor() {

  }
}

class EditorState {
  constructor(id, editor, editorDOM) {
    this.id = id;
    this.editor = editor;
    this.editorDOM = editorDOM;
    this.editorDOM.$ace_editor = editor;
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

  setConfig(config) {
    const {mode, theme, fontSize} = config;
    if (mode) this.editor.getSession().setMode(`ace/mode/${mode}`);
    if (theme) this.editor.setTheme(`ace/theme/${theme}`);
    if (fontSize) this.editor.setFontSize(fontSize);
  }

}

export default function EditorReducer (state=_state, action) {
  switch (action.type) {

    case EDITOR_REGISTER:
      var editorState = new EditorState(action.id, action.editor, action.editorDOM);
      state.editors.push(editorState);
      return state;

    default:
      return state
  }
}
