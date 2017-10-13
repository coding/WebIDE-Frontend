import React, { Component } from 'react'
import { observer } from 'mobx-react'
import i18n from 'utils/createI18n'
import FormInputGroup from './FormInputGroup'

export default observer(({ content }) => (
  <div>
    <h2 className='settings-content-header'>{i18n`settings.editor.main`}</h2>
    <div>
      {content.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
        />
      )}
    </div>
  </div>
))
