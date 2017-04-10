/* @flow weak */
import { createAction } from 'redux-actions'
import { emitter, E } from 'utils'

export const PANEL_INITIALIZE = 'PANEL_INITIALIZE'
export const initializePanels = createAction(PANEL_INITIALIZE, config => config)

export const PANEL_CONFIRM_RESIZE = 'PANEL_CONFIRM_RESIZE'
export const confirmResize = createAction(PANEL_CONFIRM_RESIZE,
  (leftViewId, leftSize, rightViewId, rightSize) => ({
    leftView: { id: leftViewId, size: leftSize },
    rightView: { id: rightViewId, size: rightSize },
  })
)

export const PANEL_TOGGLE_LAYOUT = 'PANEL_TOGGLE_LAYOUT'
export const togglePanelLayout = createAction(PANEL_TOGGLE_LAYOUT, (selectors, shouldShow) => {
  if (selectors.id && typeof selectors.id === 'string') selectors.ids = [selectors.id]
  if (selectors.ref && typeof selectors.ref === 'string') selectors.refs = [selectors.ref]
  return { selectors, shouldShow }
})

export const PANEL_REGISTER_VIEW = 'PANEL_REGISTER_VIEW'
export const registerSidePanelView = createAction(PANEL_REGISTER_VIEW)

export const PANEL_ACTIVATE_VIEW = 'PANEL_ACTIVATE_VIEW'
const _activateSidePanelView = createAction(PANEL_ACTIVATE_VIEW)
export const activateSidePanelView = (payload) => (dispatch) => {
  emitter.emit(E.PANEL_RESIZED)
  dispatch(_activateSidePanelView(payload))
}

export const PANEL_TOGGLE_VIEW = 'PANEL_TOGGLE_VIEW'
const _toggleSidePanelView = createAction(PANEL_TOGGLE_VIEW)
export const toggleSidePanelView = (payload) => (dispatch) => {
  emitter.emit(E.PANEL_RESIZED)
  dispatch(_toggleSidePanelView(payload))
}
