import React from 'react'
import { inject, observer } from 'mobx-react'
import cx from 'classnames'
import ExtensionList from '../Package/extensionList'
import SettingForm from './SettingForm'
import i18n from 'utils/createI18n'



const tabNames = {
  GENERAL: i18n`settings.tabs.general`,
  THEME: i18n`settings.tabs.theme`,
  EDITOR: i18n`settings.tabs.editor`,
  EXTENSIONS: i18n`settings.tabs.extensions`,
}

const GeneralSetting = ({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.general.main`}</h2>
    <SettingForm setting={content} />
  </div>
  )

const EditorSetting = ({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.editor.main`}</h2>
    <SettingForm setting={content} />
  </div>
  )

const ThemeSetting = ({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.theme.main`}</h2>
    <SettingForm setting={content} />
  </div>
  )

const ExtensionSetting = () => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.extension.main`}</h2>
    <ExtensionList />
  </div>
)


const DomainSetting = ({ content, domainKey }) => {
  switch (domainKey) {
    case 'GENERAL':
    default:
      return <GeneralSetting content={content} />
    case 'EDITOR':
      return <EditorSetting content={content} />
    case 'THEME':
      return <ThemeSetting content={content} />
    case 'EXTENSIONS':
      return <ExtensionSetting />
  }
}

let SettingsView = observer((props) => {
  const {
    activeTabId, tabIds, activeTab, activateTab
  } = props

  const onConfirm = () => activeTab.onConfirm && activeTab.onConfirm()
  const onCancel = () => activeTab.onCancel && activeTab.onCancel()

  return (
    <div className='settings-view'>
      <div className='settings-container'>
        <div className='settings-header'>
          <div className='tab-bar-header'>Settings</div>
          <ul className='tab-bar-tabs'>
            {tabIds.map(tabId =>
              <li key={tabId}
                className={cx('tab-bar-item', { active: tabId === activeTabId })}
                onClick={e => activateTab(tabId)}
              >{tabNames[tabId]}</li>
            )}
          </ul>
        </div>
        <div className='settings-content' >
          <div className='settings-content-container'>
            <DomainSetting content={activeTab} domainKey={activeTabId} />
          </div>
          {activeTab.requireConfirm && <div className='modal-ops settings-content-controls'>
            <button className='btn btn-default' onClick={onCancel} >{i18n`settings.reset`}</button>
            <button className='btn btn-primary'
              onClick={onConfirm}
              disabled={!activeTab.unsaved}
            >{i18n`settings.commit`}</button>
          </div>}
        </div>
      </div>
    </div>
  )
})

SettingsView = inject((state) => {
  const { activeTabId, tabIds, activeTab, activateTab } = state.SettingState
  return { activeTabId, tabIds, activeTab, activateTab }
})(SettingsView)
export default SettingsView
