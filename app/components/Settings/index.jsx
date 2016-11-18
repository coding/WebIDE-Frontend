/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'


let SettingState = {
  activeTabId: 'EDITOR',
  tabIds: ['GENERAL', 'EDITOR'],
  tabs: {
    'GENERAL': {
      id: 'GENERAL',
      language: {
        value: 'english',
        options: ['english', 'chinese']
      },
      theme: {
        value: 'light',
        options: ['light', 'dark']
      }
    },
    'EDITOR': {
      id: 'EDITOR',
      items: [{
        name: 'Keyboard Mode',
        value: '',
        options: ['default', 'vim', 'emacs']
      }, {
        name: 'Font Size',
        value: 14
      }, {
        name: 'Font Family',
        value: '',
        options: ['Consolas', 'Courier', 'Courier New', 'Menlo']
      }]
    }
  }
}

const SettingsView = (_props) => {
  const {activeTabId, tabIds, tabs} = SettingState

  return (
    <div className='settings-container'>
      <div className='settings-header'>
        <div className='tab-bar-header'>Settings</div>
        <ul className='tab-bar-tabs'>
          {tabIds.map(tabId =>
            <li key={tabId}
              className={cx('tab-bar-item', {'active': tabId === activeTabId})}
              onClick={e=>''} >{tabId}</li>
          )}
        </ul>
      </div>
      <div className='settings-content'>
        <div className='settings-content-container'>
          <SettingsContent content={tabs[activeTabId]} />
        </div>
      </div>
    </div>
  )
}

const SettingsContent = ({content}) => {
  switch (content.id) {
    case 'GENERAL':
    default:
      return <GeneralSettings {...content} />
    case 'EDITOR':
      return <EditorSettings {...content} />
  }
}

const FormGroupFactory = ({settingItem}) => {
  let formComponent
  if (settingItem.options && _.isArray(settingItem.options)) {
    return (
      <div className='form-group'>
        <label>{settingItem.name}</label>
        <select className="form-control"
          onChange={e => console.log(e.target.value)}
          value={settingItem.value} >
          {settingItem.options.map(option =>
            _.isObject(option) ?
              <option key={option.value} value={option.value}>{option.name}</option>
            : <option key={option} value={option}>{option}</option>
          )}
        </select>
      </div>)
  } else if (settingItem.isCheckbox) {
    return (
      <div className='form-group'>
        <label>{settingItem.name}</label>
        <input className="form-control"
          type='checkbox'
          value={settingItem.value} />
      </div>)
  } else {
    return (
      <div className='form-group'>
        <label>{settingItem.name}</label>
        <input className="form-control"
          type='text'
          value={settingItem.value} />
      </div>)
  }
}

const GeneralSettings = ({language, theme}) => {
  return (
    <div>
      <h2 className='settings-content-header'>General Settings</h2>
      <div className='form-group'>
        <label>Language</label>
        <select className="form-control"
          onChange={e => ''}
          value={language.value} >
          {language.options.map( (item, i) =>
            <option key={item} value={item}>{item}</option>
          )}
        </select>
      </div>
      <div className='form-group'>
        <label>Theme</label>
        <select className="form-control"
          onChange={e => ''}
          value={theme.value} >
          {theme.options.map( (item, i) =>
            <option key={item} value={item}>{item}</option>
          )}
        </select>
      </div>
    </div>
  )
}

const EditorSettings = (props) => {
  return (
    <div>
      <h2 className='settings-content-header'>Editor Settings</h2>
      {props.items.map(settingItem =>
        <FormGroupFactory key={settingItem.name} settingItem={settingItem} />
      )}
    </div>
  )
}

export default SettingsView
