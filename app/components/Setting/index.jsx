/* @flow weak */
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { inject, observer } from 'mobx-react'
import cx from 'classnames'
import _ from 'lodash'
import ExtensionList from '../Package/extensionList.js'
import SettingForm from './SettingForm'

const GeneralSettings = ({ content }) => {
  return (
    <div>
      <h2 className='settings-content-header'>General Settings</h2>
      <SettingForm domainSetting={content} />
    </div>
  )
}

const EditorSettings = ({ content }) => (
    <div>
      <h2 className='settings-content-header'>Editor Settings</h2>
      <SettingForm domainSetting={content} />
    </div>
  )

const ThemeSettings = ({ content }) => (
    <div>
      <h2 className='settings-content-header'>Theme Settings</h2>
      <SettingForm domainSetting={content} />
    </div>
  )

const ExtensionSettings = () => (
    <div>
      <h2 className='settings-content-header'>Extension Settings</h2>
      <ExtensionList />
    </div>
)


const DomainSetting = ({ content, domainKey }) => {
  switch (domainKey) {
    case 'GENERAL':
    default:
      return <GeneralSettings content={content} />
    case 'EDITOR':
      return <EditorSettings content={content} />
    case 'THEME':
      return <ThemeSettings content={content} />
    case 'EXTENSIONS':
      return <ExtensionSettings />
  }
}

let SettingsView = observer(props => {
  const {
    activeTabId, tabIds, activeTab, activateTab,
  } = props

  const onConfirm = () => activeTab.onConfirm && activeTab.onConfirm()
  const onCancel = () => activeTab.onCancel && activeTab.onCancel()

  return (
    <div className="settings-view">
      <div className="settings-container">
        <div className="settings-header">
          <div className="tab-bar-header">Settings</div>
          <ul className="tab-bar-tabs">
            {tabIds.map(tabId =>
              <li key={tabId}
                className={cx('tab-bar-item', { active: tabId === activeTabId })}
                onClick={e => activateTab(tabId)}
              >{tabId}</li>
            )}
          </ul>
        </div>
        <div className="settings-content" >
          <div className="settings-content-container">
            <DomainSetting content={activeTab} domainKey={activeTabId} />
          </div>
          {activeTab.requireConfirm && <div className="modal-ops settings-content-controls">
            <button className="btn btn-default" onClick={onCancel} >Cancel</button>
            <button className="btn btn-primary"
              onClick={onConfirm}
              disabled={!activeTab.unsaved}
            >Commit</button>
          </div>}
        </div>
      </div>
    </div>
  )
})

SettingsView = inject(state => {
  const { activeTabId, tabIds, activeTab, activateTab } = state.SettingState
  return { activeTabId, tabIds, activeTab, activateTab }
})(SettingsView)
export default SettingsView
