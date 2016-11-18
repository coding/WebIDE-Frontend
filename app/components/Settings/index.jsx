/* @flow weak */
import React, { Component } from 'react'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'


let SettingState = {
  activeItem: 'EDITOR',
  itemLabels: ['GENERAL', 'EDITOR'],
  items: {
    'GENERAL': {
      label: 'GENERAL',
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
      label: 'EDITOR',
      items: [{
        label: 'Keyboard Mode',
        value: '',
        options: ['default', 'vim', 'emacs']
      }, {
        label: 'Font Size',
        value: 14
      }, {
        label: 'Font Family',
        value: '',
        options: ['Consolas', 'Courier', 'Courier New', 'Menlo']
      }]
    }
  }
}

const SettingsView = (_props) => {
  const {activeItem, itemLabels, items} = SettingState

  return (
    <div className='settings-container'>
      <div className='settings-header'>
        <div className='nav-header'>Settings</div>
        <ul className='tabs'>
          {itemLabels.map(itemLabel =>
            <li key={itemLabel}
              className={cx('nav-item', {'active': itemLabel === activeItem})}
              onClick={e=>''} >{itemLabel}</li>
          )}
        </ul>
      </div>
      <div className='settings-content'>
        <div className='settings-content-container'>
          <SettingsContent content={items[activeItem]} />
        </div>
      </div>
    </div>
  )
}

const SettingsContent = ({content}) => {
  switch (content.label) {
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
        <label>{settingItem.label}</label>
        <select className="form-control"
          onChange={e => ''}
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
        <label>{settingItem.label}</label>
        <input className="form-control"
          type='checkbox'
          value={settingItem.value} />
      </div>)
  } else {
    return (
      <div className='form-group'>
        <label>{settingItem.label}</label>
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
        <FormGroupFactory key={settingItem.label} settingItem={settingItem} />
      )}
    </div>
  )
}

export default SettingsView
