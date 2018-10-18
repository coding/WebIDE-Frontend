import { observable, action } from 'mobx'
import { registerAction } from 'utils/actions'
import { isPlainObject } from 'utils/is'
import settings from 'settings'
import config from 'config'
import i18n from 'utils/createI18n'

const getSettingValueHelper = store => Object.keys(store)
  .filter(e => e !== '_keys' && e !== 'confirmCallBack')
  .reduce((p, v) => {
    p[v] = isPlainObject(store[v]) ? store[v].value : store[v]
    return p
  }, {})

export const SETTING_STORE_HYDRATE = 'SETTING_STORE_HYDRATE'

const tabIds = ['GENERAL', 'APPEARANCE', 'EDITOR', 'KEYMAP', 'EXTENSIONS']

if (!config.switchOldEditor) {
  tabIds.push('LANGUAGESERVER')
}

export const pluginSettingsState = observable.map()
export const pluginStore = observable({})

const state = observable({
  activeTabId: 'GENERAL',
  tabIds,
  pluginSettingsState,
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

// const mock = {
//   key: 'my-plugin-config',
//   title: 'MyPluginConfig',
//   properties: {
//     'java.home': {
//       title: 'JavaHome',
//       type: 'string',
//       default: null,
//       description: 'Specifies the folder path to the JDK (8 or more recent) used to launch the Java Language Server',
//     },
//     'java.error.incompleteclasspath.serverity': {
//       title: 'Java Error Notify',
//       type: 'string',
//       enum: [
//         'ignore',
//         'info',
//         'warning',
//         'error',
//       ],
//       default: 'warning',
//       description: 'Specifies the severity of the message when the classpath is incomplete for a Java file',
//     },
//     'java.config': {
//       type: 'boolean',
//       title: 'boolean 设置项',
//       default: true,
//       description: 'Traces the communication between VS Code and the Java language server.',
//     },
//     'java.import.exclusions': {
//       type: 'array',
//       title: '我就测试一下',
//       description: 'Configure glob patterns for excluding folders',
//       default: [
//         "**/node_modules/**",
//         "**/.metadata/**",
//         "**/archetype-resources/**",
//         "**/META-INF/maven/**"
//       ]
//     },
//   } 
// }

// pluginSettingsState.set('my-plugin-config', mock)
// pluginSettingsState.set('my-plugin-22222', { title: '测试' })
export default state
