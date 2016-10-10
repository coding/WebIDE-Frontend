/* @flow weak */
export const PANEL_INITIALIZE = 'PANEL_INITIALIZE'
export const PANEL_UNSET_COVER = 'PANEL_UNSET_COVER'

export const PANEL_SET_COVER = 'PANEL_SET_COVER'
export function setCover () {
  return {
    type: PANEL_SET_COVER,
  }
}

export const PANEL_RESIZE = 'PANEL_RESIZE'
export function resize (sectionId, dX, dY) {
  return {
    type: PANEL_RESIZE,
    sectionId: sectionId,
    dX: dX,
    dY: dY
  }
}

export const PANEL_CONFIRM_RESIZE = 'PANEL_CONFIRM_RESIZE'
export function confirmResize () {
  return {type: PANEL_CONFIRM_RESIZE}
}
