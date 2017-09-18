import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { autorun, extendObservable, observable, computed, action } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import PaneState from 'components/Pane/state'
import EditorState, { Editor } from 'components/Editor/state'

const { Tab: BaseTab, TabGroup: BaseTabGroup, state } = TabStateScope()

class Tab extends BaseTab {
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_') : props.id
    state.tabs.set(this.id, this)
    this.editorProps = props.editor
    this.update(props)
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
  set editor (editor) {
    if (editor) {
      editor.tabId = this.id
      this.editorId = editor.id
    }
    return editor
  }

  @computed get file () {
    return this.editor ? this.editor.file : null
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
export { Tab, TabGroup }
