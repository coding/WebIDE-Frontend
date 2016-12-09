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
