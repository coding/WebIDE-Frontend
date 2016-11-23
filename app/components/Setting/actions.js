import { createAction } from 'redux-actions'

export const SETTING_ACTIVATE_TAB = 'SETTING_ACTIVATE_TAB'
export const activateSettingTab = createAction(SETTING_ACTIVATE_TAB)

export const SETTING_UPDATE_FIELD = 'SETTING_UPDATE_FIELD'
export const updateSettingItem = createAction(SETTING_UPDATE_FIELD,
  (domain, fieldName, value) => ({domain, fieldName, value})
)
