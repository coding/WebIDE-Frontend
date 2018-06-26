import React from 'react'
import FormInputGroup from './FormInputGroup'

const LanguageServerSetting = ({ header, content }) => (
  <div>
    <h2 className='settings-content-header'>{header}</h2>
    <div className='project-config-container'>
      {content.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
          requireConfirm={content.requireConfirm}
        />
      )}
    </div>
  </div>
)

export default LanguageServerSetting
