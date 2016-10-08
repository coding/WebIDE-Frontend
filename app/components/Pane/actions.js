/* @flow weak */
export const PANE_INITIALIZE = 'PANE_INITIALIZE'
export const PANE_UNSET_COVER = 'PANE_UNSET_COVER'

export const PANE_SET_COVER = 'PANE_SET_COVER'
export function setCover () {
  return {
    type: PANE_SET_COVER,
  }
}

export const PANE_RESIZE = 'PANE_RESIZE'
export function resize (sectionId, dX, dY) {
  return {
    type: PANE_RESIZE,
    sectionId: sectionId,
    dX: dX,
    dY: dY
  }
}

export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'
export function confirmResize () {
  return {type: PANE_CONFIRM_RESIZE}
}

export const PANE_SPLIT = 'PANE_SPLIT'
export function split () {
  return {
    type: PANE_SPLIT,
    flexDirection: 'row',
    childrenCount: 2
  }
}
