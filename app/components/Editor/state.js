import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import assignProps from 'utils/assignProps'
import { observable, computed, action, autorun, toJS } from 'mobx'
import CodeMirror from 'codemirror'
import FileStore from 'commons/File/store'
import TabStore from 'components/Tab/store'
import defaultOptions from './codemirrorDefaultOptions'

// Ref: codemirror/mode/meta.js
function getMode (file) {
  return (file.contentType && CodeMirror.findModeByMIME(file.contentType)) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

const state = observable({
  entities: observable.map({}),
  options: {
    ...CodeMirror.defaults,
    ...defaultOptions,
  },
})

state.entities.observe((change) => {
  if (change.type === 'delete') {
    const editor = change.oldValue
    editor.dispose && editor.dispose()
  }
})

class Editor {
  constructor (props = {}) {
    this.id = props.id || uniqueId('editor_')
    state.entities.set(this.id, this)
    this.update(props)
    this.createCodeMirrorInstance()
  }

  createCodeMirrorInstance () {
    this.cmDOM = document.createElement('div')
    Object.assign(this.cmDOM.style, { width: '100%', height: '100%' })
    const cm = CodeMirror(this.cmDOM, this.options)
    this.cm = cm
    cm._editor = this

    this.dispose = autorun(() => {
      const options = Object.entries(this.options)
      options.forEach(([option, value]) => {
        this.cm.setOption(option, value)
      })
    })

    // 1. set value
    cm.setValue(this.content)
    cm.setCursor(cm.posFromIndex(this.content.length))
    // // 2. set mode
    const modeInfo = this.file ? getMode(this.file) : undefined
    if (modeInfo) {
      if (modeInfo.mode === 'null') {
        this.options.mode = null
      } else {
        import(/* webpackMode: "lazy" */
          `codemirror/mode/${modeInfo.mode}/${modeInfo.mode}.js`
        ).then(() => {
          this.options.mode = modeInfo.mime
        })
      }
    }
  }

  @action update (props = {}) {
    // simple assignments
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

  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }

  destroy () {
    this.dispose && this.dispose()
    state.entities.delete(this.id)
  }
}

export default state
export { state, Editor }
