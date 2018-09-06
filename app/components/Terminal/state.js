import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { TabStateScope } from 'commons/Tab'
import config from 'config'

const { Tab: BaseTab, TabGroup: BaseTabGroup, state } = TabStateScope()
state.keepOne = config.isLib

class Tab extends BaseTab {
  constructor (props = {}) {
    super()
    this.id = is.undefined(props.id) ? uniqueId('tab_') : props.id
    state.tabs.set(this.id, this)
    this.shared = props.shared || false
    this.extraOperations = [
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
