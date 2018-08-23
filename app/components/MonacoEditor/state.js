import uniqueId from 'lodash/uniqueId'
import { observe, observable, computed, action, extendObservable } from 'mobx'
import * as monaco from 'monaco-editor'
import mime from 'mime-types'

import assignProps from 'utils/assignProps'
import getTabType from 'utils/getTabType'
import is from 'utils/is'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import EditorState from 'components/Editor/state'
import { toDefinition } from 'components/MonacoEditor/actions'
import { findLanguageByextensions, findModeByName } from './utils/findLanguage'

import initialOptions from './monacoDefaultOptions'

const state = observable({
  entities: observable.map({}),
  options: observable.map({}),
})

const typeDetect = (title, types) => {
  if (!Array.isArray(types)) return title.toLowerCase().endsWith(`.${types}`)
  return types.reduce((p, v) => p || title.toLowerCase().endsWith(`.${v}`), false)
}

class EditorInfo {
  constructor (props = {}) {
    this.id = props.id || uniqueId('monaco_editor_')
    this.contentType = props.contentType || mime.lookup(props.filePath)
    state.entities.set(this.id, this)
    EditorState.entities.set(this.id, this)
    this.update(props)
    this.uri = this.filePath || `inmemory://model/${this.id}`
    if (!props.filePath || this.isMonaco) {
      this.createMonacoEditorInstance(props)
    }
    this.debugBreakPoints = new Map()
  }

  createMonacoEditorInstance (props) {
    this.monacoElement = document.createElement('div')
    this.monacoElement.style.width = '100%'
    this.monacoElement.style.height = '100%'

    if (this.filePath) {
      this.languageMode = findLanguageByextensions(this.filePath.split('.').pop()).id
    }

    const model = monaco.editor.getModel(
      monaco.Uri.parse(this.uri).toString())
      || monaco.editor.createModel(this.content || '', this.languageMode, monaco.Uri.parse(this.uri)
    )
    this.uri = model.uri._formatted
    const monacoEditor = monaco.editor.create(this.monacoElement, {
      ...initialOptions,
      ...props,
      model,
    }, {
      editorService: {
        openEditor: toDefinition
      }
    })

    this.disposers.push(observe(this, 'content', (change) => {
      const content = change.newValue || ''
      if (content !== monacoEditor.getValue()) {
        monacoEditor.setValue(content)
      }
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
        ln: lineNumber,
        col: column,
      }
    })

    if (props.selection) {
      const { startLineNumber, startColumn } = props.selection
      const selection = new monaco.Selection(startLineNumber, startColumn, startLineNumber, startColumn)
      this.selection = selection
      monacoEditor.setSelection(selection)
      monacoEditor.revealLineInCenter(startLineNumber, 1)
    }

    monacoEditor._editorInfo = this
    this.monacoEditor = monacoEditor

    if (props.debug) {
      this.setDebugDeltaDecorations()
    }
  }

  @observable languageMode = ''

  @observable selections = []
  @observable cursorPosition = { ln: 1, col: 1 }

  setCursor (...args) {
    // TODO
  }

  @computed get mode () {
    if (!this.filePath) return 'plaintext'
    const mode = is.string(this.languageMode) ? findModeByName(this.languageMode).aliases[0] : this.languageMode
    return mode
  }

  setDebugDeltaDecorations = () => {
    if (this.debug) {
      const { line, monacoEditor, decorations, stoppedReason } = this
      this.decorations = monacoEditor.deltaDecorations(!!decorations ? decorations : [], [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: true,
            className: 'monaco-debug-hightlight-content',
            glyphMarginClassName: stoppedReason === 'breakpoint'
              ? 'monaco-glyphMargin-breakpoint-stopped'
              : 'monaco-glyphMargin-step-stopped'
          }
        }
      ])
      monacoEditor.revealLineInCenter(line, 1)
    }
  }

  setDebuggerBreakPoint = (params) => {
    const { line, verified } = params
    const debuggerBreakPoint = this.debugBreakPoints.get(line)
    const newBreakPoint = this.monacoEditor.deltaDecorations(!!debuggerBreakPoint ? debuggerBreakPoint : [], [
      {
        range: new monaco.Range(line, 1, line, 1),
        options: {
          isWholeLine: false,
          glyphMarginClassName: verified
            ? 'monaco-glyphMargin-breakpoint'
            : 'monaco-glyphMargin-breakpoint-unverified'
        }
      }
    ])
    this.debugBreakPoints.set(line, newBreakPoint)
  }

  removeDebuggerBreakPoint = (params) => {
    const { line } = params
    if (this.debugBreakPoints.has(line)) {
      const debuggerBreakPoint = this.debugBreakPoints.get(line)
      this.monacoEditor.deltaDecorations(debuggerBreakPoint, [])
      this.debugBreakPoints.delete(line)
    }
  }

  clearDebugDeltaDecorations = () => {
    const { decorations } = this
    this.decorations = this.monacoEditor.deltaDecorations(!!decorations ? decorations : [], [])
    this.debug = false
  }

  setMode (name) {
    if (name !== this.languageMode) {
      const model = monaco.editor.getModel(`inmemory://model/${this.id}`)
      monaco.editor.setModelLanguage(model, name)
      this.languageMode = name
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
    this.monacoEditor.dispose()
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
