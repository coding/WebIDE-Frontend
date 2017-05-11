import * as actions from './actions'
import state, { Tab, TabGroup } from './state'

class TabStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  getTab (key) { return state.tabs.get(key) }
  getTabGroup (key) { return state.tabGroups.get(key) }

  isValidTab (instance) {
    return (instance instanceof Tab && state.tabs.has(instance.id))
  }

  isValidTabGroup (instance) {
    return (instance instanceof TabGroup && state.tabGroups.has(instance.id))
  }

}

const store = new TabStore()
export default store
