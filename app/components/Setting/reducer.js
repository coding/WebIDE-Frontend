/* @flow weak */
import { handleActions } from 'redux-actions'
import { OrderedMap } from 'immutable'
import { changeTheme, changeCodeTheme } from '../../utils/themeManager'
import {
  SETTING_ACTIVATE_TAB,
  SETTING_UPDATE_FIELD,
  CONFIRM_UPDATE_FIELD,
  CANCEL_UPDATE_FIELD
} from './actions'

const langCodes = {
  en_US: 'English',
  zh_CN: 'Chinese'
}

const getDefaultLangCode = () => {
  return [
    'languages',
    'language',
    'browserLanguage',
    'systemLanguage',
    'userLanguage',
  ].reduce((defaultLangCode, attr) => {
    if (defaultLangCode) return defaultLangCode
    let languages = window.navigator[attr]
    if (!Array.isArray(languages)) languages = [languages]
    return languages.reduce((defaultLangCode, lang) => {
      lang = lang.replace(/-/g, '_')
      if (Object.keys(langCodes).includes(lang)) return lang
      return defaultLangCode
    }, '')
  }, '')
}

export const UIThemeOptions = ['Light', 'Dark']
export const SyntaxThemeOptions = ['monokai', 'ambiance']

const SettingState = {
  activeTabId: 'GENERAL',
  tabIds: ['GENERAL', 'THEME', 'EDITOR'],
  tabs: {
    THEME: {
      id: 'THEME',
      items: [{
        name: 'UI Theme',
        value: 'Light',
        options: UIThemeOptions
      }, {
        name: 'Syntax Theme',
        value: 'Default',
        options: SyntaxThemeOptions
      }]
    },
    GENERAL: {
      id: 'GENERAL',
      items: [{
        name: 'Language',
        value: langCodes[getDefaultLangCode()],
        options: ['English', 'Chinese']
      }, {
        name: 'Hide Files',
        value: '/.git,/.coding-ide'
      }]
    },
    EDITOR: {
      id: 'EDITOR',
      items: [{
        name: 'Keyboard Mode',
        value: 'Default',
        options: ['Default', 'Vim', 'Emacs']
      }, {
        name: 'Font Size',
        value: 14
      }, {
        name: 'Font Family',
        value: 'Consolas',
        options: ['Consolas', 'Courier', 'Courier New', 'Menlo']
      }, {
        name: 'Charset',
        value: 'utf8',
        options: [
          {name: 'Unicode (UTF-8)', value: 'utf8'},
          {name: '中文简体 (GB18030)', value: 'gb18030'},
          {name: '中文繁体 (Big5-HKSCS)', value: 'big5'}
        ]
      }, {
        name: 'Soft Tab',
        value: true
      }, {
        name: 'Tab Size',
        value: 4,
        options: [1,2,3,4,5,6,7,8]
      }, {
        name: 'Auto Save',
        value: true
      }, {
        name: 'Auto Wrap',
        value: false
      }, {
        name: 'Live Auto Completion',
        value: true
      }, {
        name: 'Snippets',
        value: false
      }]
    }
  }
}

export default handleActions({
  [SETTING_ACTIVATE_TAB]: (state, action) => {
    return ({
      ...state,
      views: { ...state.views, activeTabId: action.payload }
    })
  },

  [SETTING_UPDATE_FIELD]: (state, action) => {
    const { domain, fieldName, value } = action.payload
    if (fieldName === 'UI Theme') { changeTheme(value); }
    if (fieldName === 'Syntax Theme') { changeCodeTheme(value); }
    return {
      ...state,
      views: { ...state.views,
        tabs: {
          ...state.views.tabs,
          [domain]: {
            ...state.views.tabs[domain],
            items: state.views.tabs[domain].items.map(settingItem => {
              if (settingItem.name === fieldName) {
                return { ...settingItem, value }
              }
              return settingItem
            })
          }
        }
      }
    }
  },
  [CONFIRM_UPDATE_FIELD]: (state) => ({
    ...state,
    data: { ...state.data, ...state.views }
  }),
  [CANCEL_UPDATE_FIELD]: (state) => ({
    ...state,
    views: { ...state.views, ...state.data }
  }),
}, { views: SettingState, data: SettingState })
