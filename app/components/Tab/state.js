import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { autorun, extendObservable, observable, computed, action } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import PaneState from 'components/Pane/state'
import EditorState, { Editor } from 'components/Editor/state'

// monaco-editor
import MonacoEditorState, { EditorInfo } from 'components/MonacoEditor/state'

const { Tab: BaseTab, TabGroup: BaseTabGroup, state } = TabStateScope()

const FileListState = observable({
  tabs: new observable.map({}),
})

class Tab extends BaseTab {
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_') : props.id
    state.tabs.set(this.id, this)
    this.editorProps = props.editor
    this.update(props)
    this.saveFileList()
    this.type = props.type
    autorun(() => {
      if (!this.file) return
      this.flags.modified = !this.file.isSynced
    })
  }
  @action update (props = {}) {
    if (is.string(props.title)) this.title = props.title
    if (is.pojo(props.flags)) extendObservable(this.flags, props.flags)
    if (is.string(props.icon)) this.icon = props.icon
    if (is.number(props.index)) this.index = props.index

    // tabGroup
    let tabGroup
    if (props.tabGroup && props.tabGroup.id) {
      tabGroup = state.tabGroups.get(props.tabGroup.id)
    }
    if (!tabGroup) tabGroup = state.activeTabGroup
    if (tabGroup && this.tabGroup !== tabGroup) tabGroup.addTab(this)

    // editor
    if (!props.editor) props.editor = {}
    props.editor.tabId = this.id
    if (this.editor) {
      this.editor.destroy()
      this.editor = new Editor(props.editor)
    } else {
      this.editor = new Editor(props.editor)
    }

    // monaco-editor
    if (this.editorInfo) {
      this.editorInfo.destroy()
      this.editorInfo = new EditorInfo(props.editor)
    } else {
      this.editorInfo = new EditorInfo(props.editor)
    }
    this.saveFileList()
  }

  @action saveFileList () {
    if (this.file) {
      FileListState.tabs.set(this.file.path, {
        id: this.id,
        isActive: false,
        file: this.file,
        icon: this.icon,
        title: this.title,
      })
    }
  }

  @observable flags = {
    modified: false
  }
  toJS () {
    if (this.file) {
      return { ...this, path: this.file.path || '', editor: this.editorProps }
    }
    return null
  }
  @computed get title () {
    if (this.file) {
      return this.file.name
    }
    return this._title
  }
  set title (v) { return this._title = v }

  @observable editorId = null
  @computed get editor () {
    // return EditorState.entities.values().find(editor => editor.tabId === this.id)
    return EditorState.entities.get(this.editorId)
  }

  @observable editorInfoid = null
  @computed get editorInfo () {
    return EditorState.entities.get(this.editorInfoid)
  }

  set editor (editor) {
    if (editor) {
      editor.tabId = this.id
      this.editorId = editor.id
    }
    return editor
  }

  set editorInfo (editorInfo) {
    if (editorInfo) {
      editorInfo.tabId = this.id
      this.editorInfoid = editorInfo.id
    }
    return editorInfo
  }

  @computed get file () {
    return this.editorInfo ? this.editorInfo.file : null
  }
}

class TabGroup extends BaseTabGroup {
  static Tab = Tab;
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_group_') : props.id
    state.tabGroups.set(this.id, this)
    extendObservable(this, props)
  }

  @computed get pane () {
    return PaneState.panes.values().find(pane => pane.contentId === this.id)
  }
}

export default state
export { Tab, TabGroup, FileListState }
