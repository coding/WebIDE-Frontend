import isObject from 'lodash//isPlainObject'
import { observable, reaction, extendObservable, computed, action, autorun } from 'mobx'
import { trim, capitalize } from 'lodash'
import editorConfig from 'utils/editorConfig'
import config from 'config'
import emitter, { THEME_CHANGED, TERM_FONTSIZE_CHANGED } from 'utils/emitter'
import is from 'utils/is'
import dynamicStyle from 'utils/dynamicStyle'
import monacoConfig from 'components/MonacoEditor/monacoDefaultOptions'
import FolderSelector from 'components/Setting/FolderSelector'
import { supportLangServer } from 'components/MonacoEditor/utils/languages'
import { dismissModal } from 'components/Modal/actions'
import { setLanguageServerOne, fetchLanguageServerSetting } from 'backendAPI/languageServerAPI'
// import { projectState } from 'components/Setting/state'

let LanguageState
import('components/MonacoEditor/LanguageClientState').then(res => LanguageState = res.default)

let createLanguageClient
import('components/MonacoEditor/actions')
  .then(res => createLanguageClient = res.createLanguageClient)

let putProjectType
import('components/Setting/actions')
  .then(res => putProjectType = res.putProjectType)

let projectState
import('components/Setting/state')
  .then(res => projectState = res.projectState)

window.themeVariables = observable.map({})

const localStorage = window.localStorage
let EditorState
import('components/Editor/state').then(res => EditorState = res.default)

const typeOptions = [
  { name: 'Blank', value: 'blank' },
  { name: 'Java', value: 'javac' }
]

if (JSON.parse(localStorage.getItem('switchOldEditor')) === null) {
  localStorage.setItem('switchOldEditor', false)
}

let uiOptions = []
if (config.isLib) {
  uiOptions = [
    { name: 'settings.appearance.uiThemeOption.dark', value: 'dark' },
  ]
} else {
  uiOptions = [
    { name: 'settings.appearance.uiThemeOption.light', value: 'light' },
    { name: 'settings.appearance.uiThemeOption.dark', value: 'dark' },
  ]
}
export const UIThemeOptions = uiOptions
export const SyntaxThemeOptions = ['default', 'neo', 'eclipse', 'monokai', 'material']
export const monacoThemeOptions = ['vs-dark']
export const fileIconOptions = ['default']

const changeUITheme = (nextThemeId) => {
  if (!config.switchOldEditor) {
    if (nextThemeId === 'light') {
      monacoConfig.theme = 'vs-light'
    } else {
      monacoConfig.theme = 'vs-dark'
    }
  }
  if (!window.themes) window.themes = {}
  if (UIThemeOptions.map(option => option.value).includes(nextThemeId)) {
    import(`!!style-loader/useable!css-loader!stylus-loader!./styles/${nextThemeId}/index.styl`)
    .then((module) => {
      const currentTheme = window.themes['@current']
      if (currentTheme && currentTheme.unuse) currentTheme.unuse()
      window.themes['@current'] = window.themes[nextThemeId] = module
      module.use()
      window.themeVariables.replace(
       window.themes['@current'].locals || window.themes['@current'].default.locals
     )
    })
  }
  emitter.emit(THEME_CHANGED, nextThemeId)
}

const changeSyntaxTheme = (nextSyntaxThemeId) => {
  if (monacoThemeOptions.includes(nextSyntaxThemeId)) {
    monacoConfig.theme = nextSyntaxThemeId
  } else {
    const uiTheme = settings.appearance.ui_theme.value
    monacoConfig.theme = `vs-${uiTheme}`
  }
}

const formatLocateName = (name) => {
  const replacedName = name.replace(/-/g, '_')
  const splitNames = replacedName.split('_')
  if (splitNames[0] === 'en') {
    return 'en_US'
  }
  return 'zh_CN'
  // return `${splitNames[0].toLowerCase()}_${splitNames[1].toUpperCase()}`
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
      lang = formatLocateName(lang)
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
      settingItem.defaultValue = settingItem.value
      settingItem.name = settingItem.name || titleCase(key)
      if (settingItem.options) {
        // don't auto-convert 'options' to observable
        settingItem.options = observable.ref(settingItem.options)
      }

      if (config.requireConfirm) {
        settingItem.tempValue = undefined
      }

      if (config.confirmCallBack) {
        this.confirmCallBack = config.confirmCallBack
      }
    })
    extendObservable(this, config)
    // fixme: this is due to late resolve of EditorState
    setTimeout(() => Object.entries(this).forEach(([key, settingItem]) => {
      if (settingItem.reaction && is.function(settingItem.reaction)) {
        reaction(() => settingItem.value, (value) => settingItem.reaction(value), {
          name: settingItem.name || key,
          fireImmediately: false,
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
    if (this.confirmCallBack) {
      const values = this.items.map(item => item.tempValue || item.value)
      this.confirmCallBack(values)
    }

    this.items.forEach((item) => {
      if (item.tempValue !== undefined) {
        item.value = item.tempValue
        item.tempValue = undefined
        if (item.onConfirm && is.function(item.onConfirm)) {
          item.onConfirm(item.value)
        }
      }
    })

    dismissModal()
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
  _keys: ['general', 'appearance', 'editor', 'keymap', 'extensions', 'languageserver'],
  get items () {
    return this._keys.map(key => this[key])
  },
  appearance: new DomainSetting({
    _keys: [
      'ui_theme',
      'syntax_theme',
      'file_icon_theme',
      'font_size',
      'terminal_font_size'
    ],
    ui_theme: {
      name: 'settings.appearance.uiTheme',
      value: 'dark',
      options: UIThemeOptions,
      reaction: changeUITheme,
    },
    syntax_theme: {
      name: 'settings.appearance.syntaxTheme',
      value: 'vs-dark',
      options: monacoThemeOptions,
      reaction: changeSyntaxTheme,
    },
    file_icon_theme: {
      name: 'settings.appearance.file_icon_theme',
      value: 'default',
      options: fileIconOptions,
      reaction: (value) => {
        config.fileicons = value
      }
    },
    font_size: {
      name: 'settings.appearance.fontSize',
      value: 13,
      reaction (value) {
        monacoConfig.fontSize = value
        dynamicStyle.set('codemirror font size',
        `.CodeMirror {
          font-size: ${value}px;
        }`)
      }
    },
    terminal_font_size: {
      name: 'settings.appearance.termFontSize',
      value: 12,
      minValue: 12,
      validator: (e) => {
        const input = e.target;
        if (input.value < 12) {
          input.value = 12;
        }
      },
      reaction (value) {
        emitter.emit(TERM_FONTSIZE_CHANGED, value)
      }
    },
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
    },
  }),

  editor: new DomainSetting({
    _keys: [
      // 'font_family',
      // 'charset',
      'indent_style',
      'indent_size',
      'tab_width',
      'trim_trailing_whitespace',
      'insert_final_newline',
      // 'auto_save',
      // 'auto_wrap',
      // 'live_auto_completion',
      // 'snippets',
    ],
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
    indent_style: {
      name: 'settings.editor.indentStyle',
      disabled: !config.switchOldEditor,
      value: 'space',
      options: [{ name: 'Space', value: 'space' }, { name: 'Tab', value: 'tab' }],
      reaction (value) {
        if (EditorState) EditorState.options.indentWithTabs = value === 'tab'
      }
    },
    indent_size: {
      name: 'settings.editor.indentSize',
      value: 4,
      disabled: !config.switchOldEditor,
      options: [1, 2, 3, 4, 5, 6, 7, 8],
      reaction (value) {
        value = Number(value)
        if (EditorState) EditorState.options.indentUnit = value
      }
    },
    tab_width: {
      name: 'settings.editor.tabWidth',
      value: 4,
      disabled: !config.switchOldEditor,
      options: [1, 2, 3, 4, 5, 6, 7, 8],
      reaction (value) {
        value = Number(value)
        monacoConfig.tabSize = value
        if (EditorState) EditorState.options.tabSize = value
      }
    },
    trim_trailing_whitespace: {
      name: 'settings.editor.trimTrailingWhitespace',
      value: 'off',
      options: ['off', 'on'],
      disabled: !config.switchOldEditor,
      reaction (value) {
        if (EditorState) EditorState.options.trimTrailingWhitespace = value
      }
    },
    insert_final_newline: {
      name: 'settings.editor.insertFinalNewline',
      value: 'off',
      options: ['off', 'on'],
      disabled: !config.switchOldEditor,
      reaction (value) {
        if (EditorState) EditorState.options.insertFinalNewline = value
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
  }),

  keymap: new DomainSetting({
    _keys: ['keyboard_mode'],
    keyboard_mode: {
      name: 'settings.keymap.keyboardMode',
      value: 'Default',
      options: !config.switchOldEditor ? ['Default'] : ['Default', 'Sublime', 'Vim', 'Emacs'],
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
    }
  }),
  languageserver: new DomainSetting({
    _keys: ['projectType', 'sourcePath'],
    requireConfirm: true,
    confirmCallBack ([lang, path]) {
      setLanguageServerOne({ type: lang, srcPath: path })
        .then((res) => {
          if (res.code === 0) {
            const prevFolder = config._ROOT_URI_
            const prevLang = config.mainLanguage
            config.mainLanguage = lang
            if (path !== '/') {
              config._WORKSPACE_SUB_FOLDER_ = path
              config._ROOT_URI_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir${path}`
            }
            const client = LanguageState.clients.get(prevLang)
            if (client) {
              if (lang !== prevLang) {
                client.destory()
                  .then(() => createLanguageClient(lang))
              } else {
                client.workSpaceFoldersChange({
                  event: {
                    added: [{ uri: `file://${config._ROOT_URI_}`, name: `JAVA-PROJECT-FOLDER-${config._ROOT_URI_}` }],
                    removed: [{ uri: `file://${prevFolder}`, name: `JAVA-PROJECT-FOLDER-${prevFolder}` }]
                  }
                })
              }
            } else {
              createLanguageClient(lang)
            }
          }
        })
    },
    projectType: {
      name: 'modal.projectType',
      value: 'Blank',
      nopersist: true,
      options: ['Blank', ...supportLangServer.map(v => v.lang)],
      reaction (value) {
        if (value !== config.mainLanguage) {
          // config.mainLanguage = value
        }
      },
    },
    sourcePath: {
      name: 'modal.sourceFolder',
      value: '/',
      nopersist: true,
      extra: FolderSelector,
      reaction (value) {
        config._WORKSPACE_SUB_FOLDER_ = value
        config._ROOT_URI_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir${value}`
      },
    }
  }),
  projectsetting: new DomainSetting({
    _keys: ['projectType', 'sourcePath', 'library'],
    requireConfirm: true,
    projectType: {
      name: 'modal.projectType',
      value: 'blank',
      options: typeOptions,
      reaction () {
      },
    },
    sourcePath: {
      name: 'modal.sourceFolder',
      value: '/src/main/java',
      extra: FolderSelector,
      reaction () {
      },
    },
    library: {
      name: 'modal.libraryFolder',
      value: '/lib',
      extra: FolderSelector,
      reaction () {
      },
    },
    confirmCallBack ([type, source, library]) {
      const projectConfigDto = {
        type,
      }
      if (type === 'blank') {
        projectConfigDto.attributes = {
          'java.source.folder': [],
          'java.library.folder': [],
        }
      } else {
        projectConfigDto.attributes = {
          'java.source.folder': trim(source, '/').split(','),
          'java.library.folder': trim(library, '/').split(','),
        }
      }

      putProjectType(projectConfigDto)
    }
  }),
  // classpathsetting: new DomainSetting({
    // _keys: ['project']
  // })
})

// for backward compatibility
// add alias "settings.theme" -> "settings.appearance"
extendObservable(settings, {
  get theme () { return this.appearance }
})

reaction(() => ({ isEnabled: editorConfig.isEnabled, rules: editorConfig.rules })
, ({ isEnabled, rules }) => {
  if (isEnabled) {
    const defaultRules = rules['*'] || {}
    editorConfig.keys.forEach((key) => {
      if (defaultRules.hasOwnProperty(key)) {
        settings.editor[key].disabled = true
        if (settings.editor[key].value !== defaultRules[key]) {
          settings.editor[key].value = defaultRules[key]
        }
      } else {
        settings.editor[key].disabled = false
        settings.editor[key].value = settings.editor[key].defaultValue
      }
    })
  } else {
    editorConfig.keys.forEach((key) => {
      settings.editor[key].disabled = false
    })
  }
})

export default settings
