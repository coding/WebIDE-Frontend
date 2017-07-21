import isObject from 'lodash/isObject'
import emitter, { THEME_CHANGED } from 'utils/emitter'
import { observable, extendObservable, computed, action, autorunAsync } from 'mobx'

export const UIThemeOptions = [
  { name: 'settings.theme.uiThemeOption.baseTheme', value: 'base-theme' },
  { name: 'settings.theme.uiThemeOption.dark', value: 'Dark' },
]
export const SyntaxThemeOptions = ['default', 'neo', 'eclipse', 'monokai', 'material']

const changeTheme = (nextThemeId) => {
  if (!window.themes) window.themes = {}
  if (UIThemeOptions.map(option => option.value).includes(nextThemeId)) {
    import(`!!style-loader/useable!css-loader!stylus-loader!./styles/${nextThemeId}/index.styl`)
    .then((module) => {
      const currentTheme = window.themes['@current']
      if (currentTheme && currentTheme.unuse) currentTheme.unuse()
      window.themes['@current'] = window.themes[nextThemeId] = module
      module.use()
    })
  }
  emitter.emit(THEME_CHANGED, nextThemeId)
}

const localeToLangs = {
  en_US: 'English',
  zh_CN: 'Chinese'
}

const getDefaultLangCode = () => {
  const langProps = [
    'languages',
    'language',
    'browserLanguage',
    'systemLanguage',
    'userLanguage',
  ]
  return langProps.reduce((defaultLangCode, attr) => {
    if (defaultLangCode) return defaultLangCode
    let languages = window.navigator[attr]
    if (!Array.isArray(languages)) languages = [languages]
    return languages.reduce((defaultLangCode, lang) => {
      if (!lang) return defaultLangCode
      lang = lang.replace(/-/g, '_')
      if (Object.keys(localeToLangs).includes(lang)) return lang
      return defaultLangCode
    }, '')
  }, '')
}

const titleCase = (snake_case_str) => // eslint-disable-line
  snake_case_str.split('_')
  .map(str => str.charAt(0).toUpperCase() + str.substr(1))
  .join(' ')


class DomainSetting {
  constructor (config) {
    Object.entries(config).forEach(([key, settingItem]) => {
      if (!isObject(settingItem)) return
      settingItem.key = key
      settingItem.name = settingItem.name || titleCase(key)
      if (settingItem.options) {
        // don't auto-convert 'options' to observable
        settingItem.options = observable.ref(settingItem.options)
      }

      if (config.requireConfirm) {
        settingItem.tempValue = undefined
      }
    })
    extendObservable(this, config)
  }

  @observable _keys = [];
  @computed
  get items () {
    return this._keys.map(key => this[key])
  }

  @action.bound
  onConfirm () {
    this.items.forEach((item) => {
      if (item.tempValue !== undefined) {
        item.value = item.tempValue
        item.tempValue = undefined
      }
    })
  }

  @action.bound
  onCancel () {
    this.items.forEach((item) => {
      if (item.tempValue !== undefined) {
        item.tempValue = undefined
      }
    })
  }

  @computed
  get unsaved () {
    if (!this.requireConfirm) return false
    return this.items.reduce((bool, item) => {
      if (bool) return bool
      return item.tempValue !== undefined
    }, false)
  }
}


const settings = observable({
  _keys: ['theme', 'extensions', 'general', 'editor'],
  get items () {
    return this._keys.map(key => this[key])
  },
  theme: new DomainSetting({
    _keys: ['ui_theme', 'syntax_theme'],
    ui_theme: {
      name: 'settings.theme.uiTheme',
      value: 'base-theme',
      options: UIThemeOptions
    },
    syntax_theme: {
      name: 'settings.theme.syntaxTheme',
      value: 'default',
      options: SyntaxThemeOptions
    }
  }),

  extensions: new DomainSetting({}),

  general: new DomainSetting({
    _keys: ['language', 'hide_files'],
    requireConfirm: true,
    language: {
      name: 'settings.general.language',
      value: localeToLangs[getDefaultLangCode()],
      options: [
      { name: 'settings.general.languageOption.english', value: 'English' },
      { name: 'settings.general.languageOption.chinese', value: 'Chinese' },
      ]
    },
    hide_files: {
      name: 'settings.general.hideFiles',
      value: '/.git,/.coding-ide'
    }
  }),

  editor: new DomainSetting({
    _keys: [
      'keyboard_mode',
      'font_size',
      'font_family',
      'charset',
      'soft_tab',
      'tab_size',
      'auto_save',
      'auto_wrap',
      'live_auto_completion',
      'snippets',
    ],

    keyboard_mode: {
      name: 'settings.editor.keyboardMode',
      value: 'Default',
      options: [{ name: 'settings.default', value: 'Default' }, 'Vim', 'Emacs']
    },
    font_size: {
      name: 'settings.editor.fontSize',
      value: 14
    },
    font_family: {
      name: 'settings.editor.fontFamily',
      value: 'Consolas',
      options: ['Consolas', 'Courier', 'Courier New', 'Menlo']
    },
    charset: {
      name: 'settings.editor.charset',
      value: 'utf8',
      options: [
        { name: 'Unicode (UTF-8)', value: 'utf8' },
        { name: '中文简体 (GB18030)', value: 'gb18030' },
        { name: '中文繁体 (Big5-HKSCS)', value: 'big5' },
      ]
    },
    soft_tab: {
      name: 'settings.editor.softTab',
      value: true
    },
    tab_size: {
      name: 'settings.editor.tabSize',
      value: 4,
      options: [1, 2, 3, 4, 5, 6, 7, 8],
    },
    auto_save: {
      name: 'settings.editor.autoSave',
      value: true
    },
    auto_wrap: {
      name: 'settings.editor.autoWrap',
      value: false
    },
    live_auto_completion: {
      name: 'settings.editor.autoCompletion',
      value: true
    },
    snippets: {
      name: 'settings.editor.snippets',
      value: false
    }
  })
})

export default settings



autorunAsync('changeTheme', () => {
  changeTheme(settings.theme.ui_theme.value)
})
