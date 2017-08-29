import { observable, action } from 'mobx'
import { registerAction } from 'utils/actions'
import { isPlainObject } from 'utils/is'
import settings from 'settings'

const getSettingValueHelper = store => Object.keys(store).filter(e => e !== '_keys').reduce((p, v) => {
  p[v] = isPlainObject(store[v]) ? store[v].value : store[v]
  return p
}, {})

export const SETTING_STORE_HYDRATE = 'SETTING_STORE_HYDRATE'


const state = observable({
  activeTabId: 'GENERAL',
  tabIds: ['GENERAL', 'THEME', 'EDITOR', 'EXTENSIONS'],
  get activeTab () {
    return settings[this.activeTabId.toLowerCase()]
  },
  settings,
  activateTab: action((tabId) => {
    state.activeTabId = tabId
  }),
  toJS () {
    return {
      editor: getSettingValueHelper(settings.editor),
      general: getSettingValueHelper(settings.general),
      theme: getSettingValueHelper(settings.theme),
    }
  }
})

export const hydrate = registerAction(SETTING_STORE_HYDRATE, (json) => {
  Object.keys(json).forEach((tabItem) => {
    Object.keys(json[tabItem]).forEach((item) => {
      const stateRef = state.settings[tabItem][item]
      if (stateRef && stateRef.value) {
        stateRef.value = json[tabItem][item]
      }
    })
  })
})


export default state
