import isObject from 'lodash/isObject'
import { observable, reaction, extendObservable, computed, action, autorunAsync } from 'mobx'
import config from 'config'
import emitter, { THEME_CHANGED } from 'utils/emitter'
import is from 'utils/is'
import dynamicStyle from 'utils/dynamicStyle'

let EditorState
import('components/Editor/state').then(res => EditorState = res.default)


export const UIThemeOptions = [
  { name: 'settings.theme.uiThemeOption.baseTheme', value: 'base-theme' },
  { name: 'settings.theme.uiThemeOption.dark', value: 'dark' },
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

  if (nextThemeId === 'dark' && EditorState.options.theme === 'default') {
    settings.theme.syntax_theme.value = 'material'
  } else if (nextThemeId === 'base-theme' && (EditorState.options.theme === 'monokai' || EditorState.options.theme === 'material')) {
    settings.theme.syntax_theme.value = 'default'
  }
  emitter.emit(THEME_CHANGED, nextThemeId)
}

const changeSyntaxTheme = (nextSyntaxThemeId) => {
  if (EditorState) EditorState.options.theme = nextSyntaxThemeId
}

const localeToLangs = {
  en_US: 'English',
  zh_CN: 'Chinese'
}

const getDefaultLangCode = () => {
  const langProps = [
    'language',
    'languages',
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
    // fixme: this is due to late resolve of EditorState
    setTimeout(() => Object.entries(this).forEach(([key, settingItem]) => {
      if (settingItem.reaction && is.function(settingItem.reaction)) {
        reaction(() => settingItem.value, (value) => settingItem.reaction(value), {
          name: settingItem.name || key,
          fireImmediately: true,
          delay: 1,
        })
      }
    }), 1)
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
      options: SyntaxThemeOptions,
      reaction (value) {
        changeSyntaxTheme(value)
      }
    }
  }),

  extensions: new DomainSetting({}),

  general: new DomainSetting({
    _keys: ['language', 'exclude_files'],
    requireConfirm: true,
    language: {
      name: 'settings.general.language',
      value: localeToLangs[getDefaultLangCode()],
      options: [
      { name: 'settings.general.languageOption.english', value: 'English' },
      { name: 'settings.general.languageOption.chinese', value: 'Chinese' },
      ]
    },
    exclude_files: {
      name: 'settings.general.hideFiles',
      value: config.fileExcludePatterns.join(','),
      reaction (value) {
        config.fileExcludePatterns = value.split(',')
      }
    }
  }),

  editor: new DomainSetting({
    _keys: [
      'keyboard_mode',
      'font_size',
      // 'font_family',
      // 'charset',
      'space_tab',
      'tab_size',
      // 'auto_save',
      // 'auto_wrap',
      // 'live_auto_completion',
      // 'snippets',
    ],

    keyboard_mode: {
      name: 'settings.editor.keyboardMode',
      value: 'Default',
      options: ['Default', 'Sublime', 'Vim', 'Emacs'],
      reaction (value) {
        if (!EditorState) return
        const keyboardMode = value.toLowerCase()
        switch (keyboardMode) {
          case 'sublime':
            import('codemirror/keymap/sublime.js').then(() => { EditorState.options.keyMap = keyboardMode })
            break
          case 'emacs':
            import('codemirror/keymap/emacs.js').then(() => { EditorState.options.keyMap = keyboardMode })
            break
          case 'vim':
            import('codemirror/keymap/vim.js').then(() => { EditorState.options.keyMap = keyboardMode })
            break
          case 'default':
          default:
            EditorState.options.keyMap = 'default'
        }
      }
    },
    font_size: {
      name: 'settings.editor.fontSize',
      value: 13,
      reaction (value) {
        dynamicStyle.set('codemirror font size',
        `.CodeMirror {
          font-size: ${value}px;
        }`)
      }
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
    space_tab: {
      name: 'settings.editor.spaceTab',
      value: true,
      reaction (value) {
        if (EditorState) EditorState.options.indentWithTabs = !value
      }
    },
    tab_size: {
      name: 'settings.editor.tabSize',
      value: 4,
      options: [1, 2, 3, 4, 5, 6, 7, 8],
      reaction (value) {
        value = Number(value)
        if (EditorState) {
          EditorState.options.tabSize = value
          EditorState.options.indentUnit = value
        }
      }
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
