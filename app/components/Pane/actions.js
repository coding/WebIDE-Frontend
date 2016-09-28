/* @flow weak */
export const PANE_INITIALIZE = 'PANE_INITIALIZE'
export const PANE_UNSET_COVER = 'PANE_UNSET_COVER'
export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'

export const PANE_SET_COVER = 'PANE_SET_COVER'
export function setCover (scope) {
  return {
    type: PANE_SET_COVER,
    scope: scope
  }
}

export const PANE_RESIZE = 'PANE_RESIZE'
export function resize (scope, sectionId, dX, dY) {
  return {
    type: PANE_RESIZE,
    sectionId: sectionId,
    scope: scope,
    dX: dX,
    dY: dY
  }
}
