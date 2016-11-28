/* @flow weak */
import { handleActions } from 'redux-actions'
import { OrderedMap } from 'immutable'
import {
  SETTING_ACTIVATE_TAB,
  SETTING_UPDATE_FIELD,
  CONFIRM_UPDATE_FIELD,
  CANCEL_UPDATE_FIELD
} from './actions'

import ace from 'brace'
import 'brace/ext/themelist'
const aceThemes = ace.acequire('ace/ext/themelist')
  .themes.map((t, i) => ({value: t.theme, name: t.caption}))

const codeToDisplay = {
  en_US: 'English',
  zh_CN: 'Chinese'
}

const codeTranslate = (language = '') => {
  if (Array.isArray(language)) {
    const specLanguage = language.find(lan => {
      lan = lan.replace(/-/g, '_')
      return Object.keys(codeToDisplay).includes(lan)
    })
    return specLanguage.replace(/-/g, '_')
  }
  const specLanguage = language.replace(/-/g, '_')
  return Object.keys(codeToDisplay).includes(specLanguage) ? specLanguage : ''
}

const getDefaultLanguage = () => [
  'languages',
  'language',
  'browserLanguage',
  'systemLanguage',
  'userLanguage']
.reduce((p, v) => p || codeTranslate(window.navigator[v]), '')

const SettingState = {
  activeTabId: 'EDITOR',
  tabIds: ['GENERAL', 'EDITOR'],
  tabs: {
    GENERAL: {
      id: 'GENERAL',
      items: [{
        name: 'Language',
        value: codeToDisplay[getDefaultLanguage()],
        options: ['English', 'Chinese']
      }, {
        name: 'Theme',
        value: 'Light',
        options: ['Light', 'Dark']
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
        name: 'Editor Theme',
        value: 'Default',
        options: aceThemes
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
