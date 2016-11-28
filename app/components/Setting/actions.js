import { createAction } from 'redux-actions'

export const SETTING_ACTIVATE_TAB = 'SETTING_ACTIVATE_TAB'
export const activateSettingTab = createAction(SETTING_ACTIVATE_TAB)

export const SETTING_UPDATE_FIELD = 'SETTING_UPDATE_FIELD'
export const CONFIRM_UPDATE_FIELD = 'CONFIRM_UPDATE_FIELD'
export const CANCEL_UPDATE_FIELD = 'CANCEL_UPDATE_FIELD'


export const updateSettingItem = createAction(SETTING_UPDATE_FIELD,
  (domain, fieldName, value) => ({ domain, fieldName, value })
)
// export const confirmSettingItem = createAction(CONFIRM_UPDATE_FIELD)

export const confirmSettingItem = () => dispatch => {
  dispatch({ type: 'MODAL_DISMISS' })
  dispatch({ type: CONFIRM_UPDATE_FIELD })
}
export const cancelSettingItem = () => dispatch => {
  dispatch({ type: 'MODAL_DISMISS' })
  dispatch({ type: CANCEL_UPDATE_FIELD })
}

