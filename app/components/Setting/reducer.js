/* @flow weak */
import { handleActions } from 'redux-actions'
import { OrderedMap } from 'immutable'
import {
  SETTING_ACTIVATE_TAB,
  SETTING_UPDATE_FIELD
} from './actions'

import ace from 'brace'
import 'brace/ext/themelist'
const aceThemes = ace.acequire('ace/ext/themelist')
  .themes.map((t, i) => ({value: t.theme, name: t.caption}))


let SettingState = {
  activeTabId: 'EDITOR',
  tabIds: ['GENERAL', 'EDITOR'],
  tabs: {
    'GENERAL': {
      id: 'GENERAL',
      items: [{
        name: 'Language',
        value: 'English',
        options: ['English', 'Chinese']
      }, {
        name: 'Theme',
        value: 'Light',
        options: ['Light', 'Dark']
      }]
    },
    'EDITOR': {
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
    return {
      ...state,
      activeTabId: action.payload
    }
  },

  [SETTING_UPDATE_FIELD]: (state, action) => {
    const {domain, fieldName, value} = action.payload

    return {
      ...state,
      tabs: {
        ...state.tabs,
        [domain]: {
          ...state.tabs[domain],
          items: state.tabs[domain].items.map(settingItem => {
            if (settingItem.name === fieldName) {
              return {...settingItem, value}
            } else {
              return settingItem
            }
          })
        }
      }
    }

  }
}, SettingState)
