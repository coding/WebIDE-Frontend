/* @flow weak */
import { createAction } from 'redux-actions'

export const PANEL_INITIALIZE = 'PANEL_INITIALIZE'
export const initializePanels = createAction(PANEL_INITIALIZE, config => config)

export const PANEL_RESIZE = 'PANEL_RESIZE'
export const resize = createAction(PANEL_RESIZE,
  (sectionId, dX, dY) => ({ sectionId, dX, dY })
)

export const PANEL_CONFIRM_RESIZE = 'PANEL_CONFIRM_RESIZE'
export const confirmResize = createAction(PANEL_CONFIRM_RESIZE)

export const PANEL_TOGGLE_LAYOUT = 'PANEL_TOGGLE_LAYOUT'
export const togglePanelLayout = createAction(PANEL_TOGGLE_LAYOUT, (selectors, shouldShow) => {
  if (selectors.id && typeof selectors.id === 'string') selectors.ids = [selectors.id]
  if (selectors.ref && typeof selectors.ref === 'string') selectors.refs = [selectors.ref]
  return { selectors, shouldShow }
})
