import { extendObservable, observable, computed } from 'mobx'
import { TabStateScope } from 'commons/Tab'
const { Tab: BaseTab, TabGroup: BaseTabGroup, entities: state } = TabStateScope()
import PaneState from 'components/Pane/state'

class Tab extends BaseTab {
  constructor (config={}) {
    super(config)
    extendObservable(this, config)
  }

  @observable path = ''
  @observable content = {}
}

class TabGroup extends BaseTabGroup {
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
