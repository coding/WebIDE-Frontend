import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { extendObservable, observable, computed, action } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import PaneState from 'components/Pane/state'
import EditorState, { Editor } from 'components/Editor/state'
import FileState, { FileNode } from 'commons/File/state'

const { Tab: BaseTab, TabGroup: BaseTabGroup, state } = TabStateScope()

class Tab extends BaseTab {
  constructor (props={}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_') : props.id
    state.tabs.set(this.id, this)
    console.log('the tab', this);
    this.update(props)
  }

  @action update (props={}) {
    if (is.string(props.title)) this.title = props.title
    if (is.pojo(props.flags)) this.flags = props.flags

    // tabGroup
    let tabGroup
    if (props.tabGroup && props.tabGroup.id) {
      tabGroup = state.tabGroups.get(props.tabGroup.id)
    }
    if (!tabGroup) tabGroup = state.activeTabGroup
    if (this.tabGroup !== tabGroup) { tabGroup && tabGroup.addTab(this) }

    // editor
    if (!props.editor) props.editor = {}
    props.editor.tabId = this.id
    if (this.editor) {
      this.editor.update(props.editor)
    } else {
      new Editor(props.editor)
    }

  }

  @observable flags = {}

  @computed get title () {
    if (this.file) {
      return this.file.name
    } else {
      return this._title
    }
  }

  set title (v) { return this._title = v }

  @computed get editor () {
    return EditorState.entities.values().find(editor => editor.tabId === this.id)
  }
  set editor (editor) {
    if (editor) editor.tabId = this.id
    return editor
  }

  @computed get file () {
    const editor = this.editor
    return editor ? editor.file : null
  }
}

class TabGroup extends BaseTabGroup {
  static Tab = Tab;
  constructor (props={}) {
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
