import { extendObservable, observable, computed, action } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import PaneState from 'components/Pane/state'
import EditorState, { Editor } from 'components/Editor/state'
import FileState, { FileNode } from 'commons/File/state'

const { Tab: BaseTab, TabGroup: BaseTabGroup, entities: state } = TabStateScope()

class Tab extends BaseTab {
  constructor (props={}) {
    super(props)
    let editor
    if (props.editor) {
      editor = new Editor(props.editor)
      editor.tabId = this.id
    }
  }

  @observable flags = {}

  @computed get editor () {
    return EditorState.entities.values().find(editor => editor.tabId === this.id)
  }

  @computed get file () {
    const editor = this.editor
    return editor ? editor.file : null
  }

  @action update (props={}) {
    if (props.title) this.title = props.title
    if (props.flags) this.flags = props.flags
    if (this.editor) {
      this.editor.update(props.editor)
    } else if (props.editor) {
      editor = new Editor(props.editor)
      editor.tabId = this.id
    }
  }
}

class TabGroup extends BaseTabGroup {
  static Tab = Tab;
  constructor (props={}) {
    super(props)
    extendObservable(this, props)
  }

  @computed get pane () {
    return PaneState.panes.values().find(pane => pane.contentId === this.id)
  }
}

export default state
export { Tab, TabGroup }
