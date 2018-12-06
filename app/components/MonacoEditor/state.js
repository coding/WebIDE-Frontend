import uniqueId from 'lodash/uniqueId'
import React from 'react'
import { render } from 'react-dom'
import { observe, observable, computed, action, extendObservable, reaction } from 'mobx'
 
import mime from 'mime-types'
import { Services } from 'monaco-languageclient'

import codeEditorService from './codeEditorService'
import assignProps from 'utils/assignProps'
import getTabType from 'utils/getTabType'
import is from 'utils/is'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import EditorState from 'components/Editor/state'
import { createMonacoServices } from 'components/MonacoEditor/Editors/createHelper'
import { findLanguageByextensions, findModeByName } from './utils/findLanguage'
import ConditionWidget from './ConditionWidget'
import initialOptions from './monacoDefaultOptions'
import config from 'config'

reaction(() => initialOptions.theme, (theme) => {
  monaco.editor.setTheme(theme)
})

const state = observable({
  entities: observable.map({}),
  options: observable.map({}),
  mountListeners: [],
  activeMonacoEditor: null,
  editors: new Map(),
  activeEditorListeners: [],
  installed: false,
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
    this.uri = this.filePath
      ? (this.filePath.startsWith('jdt://')
      || this.filePath.startsWith('omnisharp-metadata://')
      ? this.filePath
      : `file://${config._ROOT_URI_}${this.filePath}`)
      : `inmemory://model/${this.id}`

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
    const model =
    monaco.editor.getModel(monaco.Uri.parse(this.uri).toString()) ||
    monaco.editor.createModel(this.content || '', this.languageMode, monaco.Uri.parse(this.uri))
    this.uri = model.uri._formatted

    this.model = model

    const monacoEditor = monaco.editor.create(
      this.monacoElement,
      {
        ...initialOptions,
        ...props,
        model
      },
      {
        codeEditorService
      }
    )

    if (!state.installed) {
      // install Monaco language client services
      const services = createMonacoServices(monacoEditor, { rootUri: `file://${config._ROOT_URI_}` })
      Services.install(services)
      state.installed = true
    }

    state.editors.set(this.uri, monacoEditor)

    monacoEditor.onDidFocusEditorText(() => {
      state.activeMonacoEditor = monacoEditor
      if (state.activeEditorListeners && state.activeEditorListeners.length > 0) {
        for (const activeEditorListener of state.activeEditorListeners) {
          activeEditorListener({ uri: this.uri, editor: monacoEditor })
        }
      }
    })
    if (state.mountListeners && state.mountListeners.length > 0) {
      for (const mountListener of state.mountListeners) {
        mountListener(monacoEditor)
      }
    }

    this.disposers.push(observe(this, 'content', (change) => {
      const content = change.newValue || ''
      if (content !== monacoEditor.getValue()) {
        this.startsWithUTF8BOM = this.content.charCodeAt(0) === 65279
        monacoEditor.setValue(content)
      }
    }))

    if (this.content && this.content.length > 0) {
      this.startsWithUTF8BOM = this.content.charCodeAt(0) === 65279
    }
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

    monacoEditor.addAction({
      id: 'custom-comment',
      label: 'comment',
      keybindings: [
        monaco.KeyMod.CtrlCmd | monaco.KeyCode.US_SLASH
      ],
      run: () => { /* no */ }
    })

    monacoEditor.onDidChangeCursorPosition((event) => {
      this.selections = monacoEditor.getSelections()
      const {
        position: { lineNumber, column }
      } = event
      this.cursorPosition = {
        ln: lineNumber,
        col: column
      }
    })

    if (props.selection) {
      const pos = {
        lineNumber: props.selection.startLineNumber,
        column: props.selection.startColumn,
      }
      setTimeout(() => {
        monacoEditor.setSelection(props.selection)
        monacoEditor.revealPositionInCenter(pos, 1)
        monacoEditor.focus()
      }, 0)
    }

    monacoEditor._editorInfo = this
    this.monacoEditor = monacoEditor

    if (props.debug) {
      this.setDebugDeltaDecorations()
    }
  }

  @observable
  languageMode = ''

  @observable
  selections = []
  @observable
  cursorPosition = { ln: 1, col: 1 }

  setCursor (position) {
    const [lineNumber, column] = position.split(':')
    const pos = {
      lineNumber: Number(lineNumber),
      column: Number(column),
    }
    this.monacoEditor.setPosition(pos)
    this.monacoEditor.revealPositionInCenter(pos, 1)
    this.monacoEditor.focus()
  }

  @computed
  get mode () {
    if (!this.filePath) return 'plaintext'
    const mode = is.string(this.languageMode)
      ? findModeByName(this.languageMode) && findModeByName(this.languageMode).aliases[0]
      : this.languageMode
    return mode
  }

  setDebugDeltaDecorations = () => {
    if (this.debug) {
      const { line, monacoEditor, decorations, stoppedReason } = this
      this.decorations = monacoEditor.deltaDecorations(decorations || [], [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: stoppedReason !== 'definition',
            className: 'monaco-debug-hightlight-content',
            glyphMarginClassName:
              stoppedReason === 'definition'
                ? 'monaco-glyphMargin-breakpoint'
                : stoppedReason === 'breakpoint'
                ? 'monaco-glyphMargin-breakpoint-stopped'
                : 'monaco-glyphMargin-step-stopped'
          }
        }
      ])

      const pos = {
        lineNumber: line,
        column: 1
      }

      setTimeout(() => {
        monacoEditor.setPosition(pos)
        monacoEditor.revealPositionInCenter(pos, 1)
      }, 0)
    }
  }

  setViewZoneForBreakPoint = (breakpoint) => {
    return new Promise((resolve, reject) => {
      const { path, line } = breakpoint

      this.monacoEditor.changeViewZones((changeAccessor) => {
        const domNode = document.createElement('div')
        const viewZoneId = changeAccessor.addZone({
          afterLineNumber: line,
          heightInLines: 2,
          afterColumn: 0,
          domNode,
        })
        const handleCancel = () => {
          this.monacoEditor.changeViewZones((_changeAccessor) => {
            _changeAccessor.removeZone(viewZoneId)
          })
        }
        render(<ConditionWidget onChange={resolve} onCancel={handleCancel} breakpoint={breakpoint} />, domNode)
      })
    })
  }

  setDebuggerBreakPoint = (params) => {
    const { line, verified } = params
    const debuggerBreakPoint = this.debugBreakPoints.get(line)
    const newBreakPoint = this.monacoEditor.deltaDecorations(
      debuggerBreakPoint || [],
      [
        {
          range: new monaco.Range(line, 1, line, 1),
          options: {
            isWholeLine: false,
            glyphMarginClassName: verified
              ? 'monaco-glyphMargin-breakpoint'
              : 'monaco-glyphMargin-breakpoint-unverified'
          }
        }
      ]
    )
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
    this.decorations = this.monacoEditor.deltaDecorations(decorations || [], [])
    this.debug = false
  }

  setMode (name) {
    if (name !== this.languageMode) {
      const model = monaco.editor.getModel(this.uri)
      monaco.editor.setModelLanguage(model, name)
      this.languageMode = name
    }
  }

  setEncoding (encoding) {
    return FileStore.syncFile({ path: this.filePath, encoding })
  }

  @action
  update (props = {}) {
    extendObservable(this, props)
    assignProps(this, props, {
      tabId: String,
      filePath: String,
      gitBlame: Object
    })
    this._content = props.content || ''

    if (props.monacoEditor) {
      this.monacoEditor = props.monacoEditor
    }
  }

  @observable
  _options = observable.map({})
  @computed
  get options () {
    const options = { ...state.options, ...this._options.toJS() }
    const self = this
    const descriptors = Object.entries(options).reduce((acc, [key, value]) => {
      acc[key] = {
        enumerable: true,
        get () {
          return value
        },
        set (v) {
          self._options.set(key, v)
        }
      }
      return acc
    }, {})
    return Object.defineProperties({}, descriptors)
  }

  set options (value) {
    this._options = observable.map(value)
  }

  @observable
  tabId = ''
  @computed
  get tab () {
    return TabStore.getTab(this.tabId)
  }

  @observable
  filePath = undefined
  @computed
  get file () {
    return FileStore.get(this.filePath)
  }

  @observable
  _content = ''
  @computed
  get content () {
    return this.file ? this.file.content : this._content
  }
  set content (v) {
    return (this._content = v)
  }

  @computed
  get revision () {
    return this.file ? this.file.revision : null
  }

  @observable
  gitBlame = {
    show: false,
    data: observable.ref([])
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
    if (typeDetect(this.file.name, ['html', 'htm'])) {
      return 'htmlEditor'
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
