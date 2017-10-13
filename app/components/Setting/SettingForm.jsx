import React from 'react'
import { observer } from 'mobx-react'
import FormInputGroup from './FormInputGroup'

export default observer(({ header, content }) => (
  <div>
    <h2 className='settings-content-header'>{ header }</h2>
    <div>
      {content.items.map(settingItem =>
        <FormInputGroup
          key={settingItem.key}
          settingItem={settingItem}
          requireConfirm={content.requireConfirm}
        />
      )}
    </div>
  </div>
))
