import { observable, action } from 'mobx'
import { registerAction } from 'utils/actions'
import { isPlainObject } from 'utils/is'
import settings from 'settings'
import i18n from 'utils/createI18n'

const getSettingValueHelper = store => Object.keys(store).filter(e => e !== '_keys').reduce((p, v) => {
  p[v] = isPlainObject(store[v]) ? store[v].value : store[v]
  return p
}, {})

export const SETTING_STORE_HYDRATE = 'SETTING_STORE_HYDRATE'


const state = observable({
  activeTabId: 'GENERAL',
  tabIds: ['GENERAL', 'APPEARANCE', 'EDITOR', 'KEYMAP', 'EXTENSIONS'],
  tabNames: {
    GENERAL: i18n`settings.tabs.general`,
    APPEARANCE: i18n`settings.tabs.appearance`,
    EDITOR: i18n`settings.tabs.editor`,
    KEYMAP: i18n`settings.tabs.keymap`,
    EXTENSIONS: i18n`settings.tabs.extensions`,
  },
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
      appearance: getSettingValueHelper(settings.appearance),
    }
  },
})

export const hydrate = registerAction(SETTING_STORE_HYDRATE, (json) => {
  Object.keys(json).forEach((tabItem) => {
    Object.keys(json[tabItem]).forEach((item) => {
      const stateRef = state.settings[tabItem][item]
      if (stateRef && stateRef.value && !stateRef.nopersist) {
        stateRef.value = json[tabItem][item]
      }
    })
  })
})

export default state
