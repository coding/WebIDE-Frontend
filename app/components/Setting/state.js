import { observable, action } from 'mobx'
import { registerAction } from 'utils/actions'
import { isPlainObject } from 'utils/is'
import settings from 'settings'
import config from 'config'
import i18n from 'utils/createI18n'
import { pluginSettingsItem } from 'components/Plugins/store'

const getSettingValueHelper = store => Object.keys(store)
  .filter(e => e !== '_keys' && e !== 'confirmCallBack')
  .reduce((p, v) => {
    p[v] = isPlainObject(store[v]) ? store[v].value : store[v]
    return p
  }, {})

export const SETTING_STORE_HYDRATE = 'SETTING_STORE_HYDRATE'

const tabIds = ['GENERAL', 'APPEARANCE', 'EDITOR', 'KEYMAP', 'LANGUAGESERVER']

export const pluginSettingStore = observable({})

const state = observable({
  activeTabId: 'GENERAL',
  tabIds,
  pluginSettingsItem,
  tabNames: {
    GENERAL: i18n`settings.tabs.general`,
    APPEARANCE: i18n`settings.tabs.appearance`,
    EDITOR: i18n`settings.tabs.editor`,
    KEYMAP: i18n`settings.tabs.keymap`,
    EXTENSIONS: i18n`settings.tabs.extensions`,
    LANGUAGESERVER: i18n`settings.tabs.languageserver`,
    PROJECTSETTING: i18n`settings.tabs.projectsetting`
  },
  get activeTab () {
    return settings[this.activeTabId.toLowerCase()] || null
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
      // languageserver: getSettingValueHelper(settings.languageserver),
    }
  },
})

const projectState = observable({
  projectResolve: [
    {
      type: 'blank',
      attributes: {},
      matched: true
    }
  ],
  estimated: true,
  selectedResolve: 'blank',
  get currentResolve () {
    if (this.estimated) {
      return _.find(this.projectResolve, { type: this.selectedResolve })
    }
    return this.projectResolve
  },
  get isJava () {
    return this.selectedResolve === 'javac' || this.selectedResolve === 'maven'
  },
  get mavenResolve () {
    if (this.estimated) {
      return _.find(this.projectResolve, { type: 'maven' })
    }
    return this.projectResolve
  },
  classpath: [],
  libs: [],
  sources: [],
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
  config.rehydrated = true
})

export { projectState }

export default state
