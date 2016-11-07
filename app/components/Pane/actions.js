/* @flow weak */
import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'

export const PANE_INITIALIZE = 'PANE_INITIALIZE'
export const PANE_UNSET_COVER = 'PANE_UNSET_COVER'

export const PANE_SET_COVER = 'PANE_SET_COVER'
export const setCover = createAction(PANE_SET_COVER)

export const PANE_RESIZE = 'PANE_RESIZE'
export const resize = createAction(PANE_RESIZE,
  (sectionId, dX, dY) => ({sectionId, dX, dY})
)

export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'
export const confirmResize = createAction(PANE_CONFIRM_RESIZE)

export const PANE_SPLIT_WITH_KEY = 'PANE_SPLIT_WITH_KEY'
export const split = createAction(PANE_SPLIT_WITH_KEY,
  (splitCount, flexDirection='row') => ({splitCount, flexDirection})
)

export const PANE_SPLIT = 'PANE_SPLIT'
export const splitTo = promiseActionMixin(
  createAction(PANE_SPLIT, (paneId, splitDirection) => ({paneId, splitDirection}))
)
