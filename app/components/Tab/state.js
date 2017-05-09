import { extendObservable, observable, computed } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import PaneState from 'components/Pane/state'
import EditorState, { Editor } from 'components/Editor/state'
import FileState, { FileNode } from 'commons/File/state'

const { Tab: BaseTab, TabGroup: BaseTabGroup, entities: state } = TabStateScope()

class Tab extends BaseTab {
  constructor (config={}) {
    super(config)
    extendObservable(this, config)
    if (config.path) {
      new Editor({ filePath: config.path, tabId: this.id })
    } else if (config.content) {
      new Editor({ content: config.content, tabId: this.id })
    }
    return this
  }

  @observable path = ''
  @observable content = ''

  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }

  @computed
  get editor () {
    return EditorState.entities.values().find(editor => editor.tabId === this.id)
  }
}

class TabGroup extends BaseTabGroup {
  static Tab = Tab;
  constructor (config={}) {
    super(config)
    extendObservable(this, config)
  }

  @computed get pane () {
    return PaneState.panes.values().find(pane => pane.contentId === this.id)
  }
}

export default state
export { Tab, TabGroup }
