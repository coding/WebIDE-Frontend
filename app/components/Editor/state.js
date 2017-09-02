import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import getTabType from 'utils/getTabType'
import assignProps from 'utils/assignProps'
import { reaction, observe, observable, computed, action, autorun, extendObservable } from 'mobx'
import CodeMirror from 'codemirror'
import FileStore from 'commons/File/store'
import TabStore from 'components/Tab/store'
import overrideDefaultOptions from './codemirrorDefaultOptions'
import { loadMode } from './components/CodeEditor/addons/mode'
import { findModeByFile, findModeByMIME, findModeByName } from './components/CodeEditor/addons/mode/findMode'

const typeDetect = (title, types) => {
  // title is the filename
  // typeArray is the suffix
  if (!Array.isArray(types)) return title.endsWith(`.${types}`)
  return types.reduce((p, v) => p || title.endsWith(`.${v}`), false)
}

const defaultOptions = { ...CodeMirror.defaults, ...overrideDefaultOptions }

const state = observable({
  entities: observable.map({}),
  options: observable.shallow(defaultOptions),
})

state.entities.observe((change) => {
  if (change.type === 'delete') {
    const editor = change.oldValue
    if (editor.dispose) editor.dispose()
  }
})

class Editor {
  constructor (props = {}) {
    this.id = props.id || uniqueId('editor_')
    state.entities.set(this.id, this)
    this.update(props)
    if (!props.filePath || this.isCM) {
      this.createCodeMirrorInstance()
    }
  }

  createCodeMirrorInstance () {
    this.cmDOM = document.createElement('div')
    Object.assign(this.cmDOM.style, { width: '100%', height: '100%' })
    const cm = CodeMirror(this.cmDOM, this.options)
    this.cm = cm
    cm._editor = this
    const setOption = this.cm.setOption.bind(this.cm)
    this.cm.setOption = this.setOption = (option, value) => {
      this._options.set(option, value)
    }

    this.disposers.push(autorun(() => {
      const options = Object.entries(this.options)
      options.forEach(([option, value]) => {
        if (this.cm.options[option] === value) return
        setOption(option, value)
      })
    }))

    this.disposers.push(observe(this, 'content', (change) => {
      const content = change.newValue || ''
      if (content !== cm.getValue()) cm.setValue(content)
    }))

    this.disposers.push(reaction(() => {
      if (this.tab && this.tab.isActive) return this.tab
    }, (activeTab) => {
      if (!activeTab) return
      if (activeTab.editor && activeTab.editor.cm) {
        setTimeout(() => {
          activeTab.editor.cm.refresh()
          activeTab.editor.cm.focus()
        }, 1)
      }
    }))
    // 1. set value
    if (this.content) {
      cm.setValue(this.content)
    }
    if (!this.file) {
      cm.setCursor(cm.posFromIndex(this.content.length))
    }
    // 2. set mode
    const modeInfo = findModeByFile(this.file)
    if (modeInfo) {
      loadMode(modeInfo.mode).then(() => this.options.mode = modeInfo.mime)
    }
    // 3. sync cursor state to corresponding editor properties
    cm.on('cursorActivity', () => {
      this.selections = cm.getSelections()
      const { line, ch } = cm.getCursor()
      this.cursorPosition = {
        ln: line + 1,
        col: ch + 1,
      }
    })
  }

  @observable selections = []
  @observable cursorPosition = { ln: 1, col: 1 }

  setCursor (...args) {
    if (!args[0]) return
    const lineColExp = args[0]
    if (is.string(lineColExp)) {
      const [line = 0, ch = 0] = lineColExp.split(':')
      args = [line - 1, ch - 1]
    }
    this.cm.setCursor(...args)
    setTimeout(() => this.cm.focus())
  }

  @computed get mode () {
    if (!this.options.mode) return ''
    const modeInfo = findModeByMIME(this.options.mode)
    return modeInfo.name
  }

  setMode (mode) {
    const modeInfo = is.string(mode) ? findModeByName(mode) : mode
    this.options.mode = modeInfo.mime
  }

  @action update (props = {}) {
    // simple assignments
    extendObservable(this, props)
    assignProps(this, props, {
      tabId: String,
      filePath: String,
      gitBlame: Object,
    })
    // file
    if (!this.file && props.content) {
      this._content = props.content
    }
    if (props.cm instanceof CodeMirror) this.cm = props.cm
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
    if (typeDetect(this.file.name, 'md')) {
      type = 'editorWithPreview'
    }
    if (typeDetect(this.file.name, ['png', 'jpg', 'jpeg', 'gif'])) {
      type = 'imageEditor'
    }
    return type
  }

  @computed
  get isCM () {
    return this.editorType === 'default' || this.editorType === 'editorWithPreview'
  }

  disposers = []
  dispose () {
    this.disposers.forEach(disposer => disposer && disposer())
  }

  destroy () {
    this.dispose && this.dispose()
    state.entities.delete(this.id)
  }
}

export default state
export { state, Editor }
