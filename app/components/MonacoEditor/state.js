import uniqueId from 'lodash/uniqueId'
import { observable, computed, action, extendObservable } from 'mobx'
import * as monaco from 'monaco-editor'

import assignProps from 'utils/assignProps'
import getTabType from 'utils/getTabType'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import EditorState from 'components/Editor/state'
import { findModeByExtension } from 'components/Editor/components/CodeEditor/addons/mode/findMode'

import initialOptions from './monacoDefaultOptions'

const state = observable({
  entities: observable.map({}),
  options: observable.map({
    lineNumbers: true,
    selectOnLineNumbers: true,
    glyphMargin: true,
    roundedSelection: true,
    language: 'javascript',
    minimap: {
      enabled: true,
      renderCharacters: false,
    },
    contextmenu: false,
    theme: 'vs-dark',
  }),
})

const typeDetect = (title, types) => {
  if (!Array.isArray(types)) return title.toLowerCase().endsWith(`.${types}`)
  return types.reduce((p, v) => p || title.toLowerCase().endsWith(`.${v}`), false)
}

class EditorInfo {
  constructor (props = {}) {
    this.id = props.id || uniqueId('monaco_editor_')
    state.entities.set(this.id, this)
    EditorState.entities.set(this.id, this)
    this.update(props)
    // this.mode = 
    if (!props.filepath || this.isMonaco) {
      this.createMonacoEditorInstance()
    }
  }

  createMonacoEditorInstance () {
    this.monacoElement = document.createElement('div')
    this.monacoElement.style.width = '100%'
    this.monacoElement.style.height = '100%'
    const monacoEditor = monaco.editor.create(this.monacoElement, {
      ...initialOptions,
      model: monaco.editor.createModel(this.content || '', this.mode),
    })

    // const model = monaco.editor.createModel(this.content || '', this.mode, '')
    // if (this.content) {
    //   debugger
    //   const newModel =
    //   try {
    // monacoEditor.setModel(model)
    //   } catch (err) {
    //     console.log(err)
    //   }
    // }
    monacoEditor._editorInfo = this
    this.monacoEditor = monacoEditor

    // this.monacoEditor.onDidChangeCursorPosition((event) => {
    //   this.selections = this.monacoEditor.getSelections
    //   const { position: { lineNumber, column } } = event
    //   this.cursorPosition = {
    //     line: lineNumber + 1,
    //     col: column + 1,
    //   }
    // })
  }

  @observable selections = []
  @observable cursorPosition = { line: 1, column: 1 }

  setCursor (...args) {
    // TODO
  }

  @computed get mode () {
    return findModeByExtension(this.filePath.split('.').pop()).name.toLocaleLowerCase()
  }

  setMode (mode) {
    // TODO
  }

  setEncoding (encoding) {
    return FileStore.syncFile({ path: this.filePath, encoding })
  }

  @action update (props = {}) {
    extendObservable(this, props)
    assignProps(this, props, {
      tabId: String,
      filePath: String,
      gitBlame: Object,
    })
    if (!this.file && props.content) {
      this._content = props.content
    }

    if (props.monacoEditor) {
      this.monacoEditor = props.monacoEditor
    }
  }

  @observable _options = observable.map({})
  @computed get options () {
    const options = { ...state.options, ...this._options.toJS() }
    const self = this
    const descriptors = Object.entries(options).reduce((acc, [key, value]) => {
      acc[key] = {
        enumerable: true,
        get () { return value },
        set (v) { self._options.set(key, v) },
      }
      return acc
    }, {})
    return Object.defineProperties({}, descriptors)
  }

  set options (value) {
    this._options = observable.map(value)
  }


  @observable tabId = ''
  @computed get tab () { return TabStore.getTab(this.tabId) }

  @observable filePath = undefined
  @computed get file () { return FileStore.get(this.filePath) }

  @observable _content = ''
  @computed get content () {
    return this.file ? this.file.content : this._content
  }
  set content (v) { return this._content = v }

  @computed get revision () {
    return this.file ? this.file.revision : null
  }

  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }

  @computed
  get editorType () {
    let type = 'default'
    if (!this.file) return type
    if (this.file.contentType) {
      if (getTabType(this.file) === 'IMAGE') {
        type = 'imageEditor'
      } else if (getTabType(this.file) === 'UNKNOWN') {
        type = 'unknownEditor'
      }
    }
    if (this.file.contentType === 'text/html') {
      type = 'htmlEditor'
    } else if (typeDetect(this.file.name, ['md', 'markdown', 'mdown'])) {
      type = 'editorWithPreview'
    }
    if (typeDetect(this.file.name, ['png', 'jpg', 'jpeg', 'gif'])) {
      type = 'imageEditor'
    }
    return type
  }

  @computed
  get isMonaco () {
    return this.editorType === 'default' || this.editorType === 'editorWithPreview' || this.editorType === 'htmlEditor'
  }

  disports = []
  dispose () {
    // TODO
  }

  destroy (async) {
    if (async) {
      setTimeout(() => {
        if (this.tab) return

        state.entities.delete(this.id)
      }, 1000)
    } else {
      state.entities.delete(this.id)
    }
  }
  // setCursor (...args) {
  //   if (!args[0]) return

  //   // const line
  // }

  // @computed get mode () {
  //   if (!this.options.mode) return ''

  //   const modeinfo = 
  // }
}

export default state
export { state, EditorInfo }
