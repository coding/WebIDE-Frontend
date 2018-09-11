import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { observable, computed } from 'mobx'
import { TabStateScope } from 'commons/Tab'
import config from 'config'

const { Tab: BaseTab, TabGroup: BaseTabGroup, state } = TabStateScope()
state.keepOne = config.isLib

class Tab extends BaseTab {
  @observable shared = false
  // @observable extraOperations = null
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_') : props.id
    state.tabs.set(this.id, this)
    this.shared = props.shared || false
    this.termId = props.termId || null
    this.sharer = props.sharer || null
  }

  set shared (shared) {
    this.shared = shared
  }

  get shared () {
    return this.shared
  }

  @computed get extraOperations () {
    return [
      {
        icon: `fa fa-share-alt ${this.shared ? 'shared-highlight' : ''}`,
        command: 'terminal:shared',
        shared: false
      }
    ]
  }
}

class TabGroup extends BaseTabGroup {
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_group_') : props.id
    state.tabGroups.set(this.id, this)
  }
}

export default state
export { Tab, TabGroup, state }
