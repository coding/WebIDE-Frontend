import uniqueId from 'lodash/uniqueId'
import { observe, observable, computed, action, extendObservable } from 'mobx'
import * as monaco from 'monaco-editor'

import assignProps from 'utils/assignProps'
import getTabType from 'utils/getTabType'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import EditorState from 'components/Editor/state'
import { toDefinition } from 'components/MonacoEditor/actions'
import { findLanguageByextensions } from './utils/findLanguage'

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
    this.contentType = props.contentType || 'TEXT'
    state.entities.set(this.id, this)
    EditorState.entities.set(this.id, this)
    this.update(props)
    this.uri = this.filePath || `inmemory://model/${this.id}`
    if (!props.filePath || this.isMonaco) {
      this.createMonacoEditorInstance(props)
    }
  }

  createMonacoEditorInstance (props) {
    this.monacoElement = document.createElement('div')
    this.monacoElement.style.width = '100%'
    this.monacoElement.style.height = '100%'

    if (this.filePath) {
      this.languageMode = findLanguageByextensions(this.filePath.split('.').pop()).id
    }

    const model = monaco.editor.getModel(`inmemory://model/${this.id}`)
    const monacoEditor = monaco.editor.create(this.monacoElement, {
      ...initialOptions,
      ...props,
      model: model || monaco.editor.createModel(this.content || '', this.mode, monaco.Uri.parse(`inmemory://model/${this.id}`)),
    }, {
      editorService: {
        openEditor: toDefinition
      }
    })
    this.disposers.push(observe(this, 'content', (change) => {
      const content = change.newValue || ''
      if (content !== monacoEditor.getValue()) monacoEditor.setValue(content)
    }))
    /**
     * tablesseditor 新建 tab 自动聚焦光标位置
     */
    if (props.autoFocus) {
      const docLength = props.content.length
      const { lineNumber, column } = model.getPositionAt(docLength)
      monacoEditor.setSelection({
        startLineNumber: lineNumber,
        startColumn: column,
        endLineNumber: lineNumber,
        endColumn: column
      })
      monacoEditor.focus()
    }

    monacoEditor.onDidChangeCursorPosition((event) => {
      this.selections = monacoEditor.getSelections()
      const { position: { lineNumber, column } } = event
      this.cursorPosition = {
        ln: lineNumber + 1,
        col: column + 1,
      }
    })

    if (props.selection) {
      this.selection = props.selection
      monacoEditor.setSelection(props.selection)
    }

    monacoEditor._editorInfo = this
    this.monacoEditor = monacoEditor
  }

  @observable languageMode = ''

  @observable selections = []
  @observable cursorPosition = { ln: 1, col: 1 }

  setCursor (...args) {
    // TODO
  }

  @computed get mode () {
    if (!this.filePath) return 'plaintext'
    return this.languageMode
  }

  setMode (mode) {
    if (mode !== this.languageMode) {
      const model = monaco.editor.getModel(`inmemory://model/${this.id}`)
      this.languageMode = mode
      monaco.editor.setModelLanguage(model, mode)
    }
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
    const contentType = getTabType(this.contentType)
    if (!this.file) {
      return 'textEditor'
    }
    if (typeDetect(this.file.name, ['md', 'markdown', 'mdown'])) {
      return 'markdownEditor'
    }
    if (typeDetect(this.file.name, ['png', 'jpg', 'jpeg', 'gif', 'webp', 'ico', 'bmp'])) {
      return 'imageEditor'
    }
    switch (contentType) {
      case 'TEXT':
        return 'textEditor'
      case 'HTML':
        return 'htmlEditor'
      case 'MARKDOWN':
        return 'markdownEditor'
      case 'IMAGE':
        return 'imageEditor'
      case 'UNKNOWN':
        return 'unknownEditor'
      default:
        return 'unknownEditor'
    }
  }

  @computed
  get isMonaco () {
    return ['textEditor', 'markdownEditor', 'htmlEditor'].includes(this.editorType)
  }

  disposers = []
  dispose () {
    this.disposers.forEach(disposer => disposer && disposer())
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
