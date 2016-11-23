/* @flow weak */
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import cx from 'classnames'
import _ from 'lodash'

import * as SettingActions from './actions'

let FormGroupFactory = ({ domain, settingItem, dispatch }) => {
  let formComponent
  const updateSettingItem = e => {
    const value = (() => {
      switch (e.target.type) {
        case 'checkbox':
          return e.target.checked
        case 'number':
          return Number(e.target.value)
        case 'text':
          return e.target.value
      }
    })()

    return dispatch(
      SettingActions.updateSettingItem(domain, settingItem.name, value)
    )
  }

  if (settingItem.options && _.isArray(settingItem.options)) {
    return (
      <div className="form-group">
        <label>{settingItem.name}</label>
        <select className="form-control"
          onChange={updateSettingItem}
          value={settingItem.value}
        >
          {settingItem.options.map(option =>
            _.isObject(option) ?
              <option key={option.value} value={option.value}>{option.name}</option>
            : <option key={option} value={option}>{option}</option>
          )}
        </select>
      </div>)
  } else if (_.isBoolean(settingItem.value)) {
    return (
      <div className="form-group">
        <div className="checkbox">
          <label>
            <input type="checkbox"
              onChange={updateSettingItem} checked={settingItem.value}
            />
            <strong>{settingItem.name}</strong>
          </label>

        </div>
      </div>)
  } else {
    return (
      <div className="form-group">
        <label>{settingItem.name}</label>
        <input className="form-control"
          type={_.isNumber(settingItem.value) ? 'number' : 'text'}
          min="1"
          onChange={updateSettingItem}
          value={settingItem.value}
        />
      </div>)
  }
}
FormGroupFactory = connect(null)(FormGroupFactory)

const GeneralSettings = (props) => (
    <div>
      <h2 className='settings-content-header'>General Settings</h2>
      {props.items.map(settingItem =>
        <FormGroupFactory
          key={settingItem.name}
          domain='GENERAL'
          settingItem={settingItem} />
      )}
    </div>
  )

const EditorSettings = (props) => (
    <div>
      <h2 className='settings-content-header'>Editor Settings</h2>
      {props.items.map(settingItem =>
        <FormGroupFactory
          key={settingItem.name}
          domain='EDITOR'
          settingItem={settingItem} />
      )}
    </div>
  )


const SettingsContent = ({ content }) => {
  switch (content.id) {
    case 'GENERAL':
    default:
      return <GeneralSettings {...content} />
    case 'EDITOR':
      return <EditorSettings {...content} />
  }
}

let SettingsView = (props) => {
  const {
  views: { activeTabId, tabIds, tabs },
    activateSettingTab,
    confirmSettingItem,
    cancelSettingItem
} = props

  return (
    <div name="settings-view">
      <div className="settings-container">
        <div className="settings-header">
          <div className="tab-bar-header">Settings</div>
          <ul className="tab-bar-tabs">
            {tabIds.map(tabId =>
              <li key={tabId}
                className={cx('tab-bar-item', { active: tabId === activeTabId })}
                onClick={e => activateSettingTab(tabId)}
              >{tabId}</li>
            )}
          </ul>
        </div>
        <div className="settings-content" style={{ overflow: 'scroll' }}>
          <div className="settings-content-container">
            <SettingsContent content={tabs[activeTabId]} />
          </div>
        </div>
      </div>
      <div className="modal-ops">
        <button
          className="btn btn-default"
          onClick={() => { cancelSettingItem(); }
       }>
          Cancel
        </button>
        <button
          className="btn btn-primary"
          onClick={() => { confirmSettingItem(); }
       }>
        Commit
        </button>
      </div>
    </div>

  )
}
SettingsView = connect(
  state => (state.SettingState),
  dispatch => bindActionCreators(SettingActions, dispatch)
)(SettingsView)

export default SettingsView
