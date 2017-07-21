import { observable, action } from 'mobx'
import settings from 'settings'

const state = observable({
  activeTabId: 'GENERAL',
  tabIds: ['GENERAL', 'THEME', 'EDITOR', 'EXTENSIONS'],
  get activeTab () {
    return settings[this.activeTabId.toLowerCase()]
  },
  settings,
  activateTab: action((tabId) => {
    state.activeTabId = tabId
  })
})


export default state
