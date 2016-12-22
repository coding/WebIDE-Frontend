/* @flow weak */
import {
  getNextSibling,
  getPrevSibling,
} from './selectors'

import { createAction } from 'redux-actions'
import { promiseActionMixin } from '../../utils'

export const PANE_INITIALIZE = 'PANE_INITIALIZE'
export const PANE_UNSET_COVER = 'PANE_UNSET_COVER'

export const PANE_SET_COVER = 'PANE_SET_COVER'
export const setCover = createAction(PANE_SET_COVER)

export const PANE_CONFIRM_RESIZE = 'PANE_CONFIRM_RESIZE'
export const confirmResize = createAction(PANE_CONFIRM_RESIZE,
  (leftViewId, leftSize, rightViewId, rightSize) => ({
    leftView: { id: leftViewId, size: leftSize },
    rightView: { id: rightViewId, size: rightSize },
  })
)

export const PANE_SPLIT_WITH_KEY = 'PANE_SPLIT_WITH_KEY'
export const split = createAction(PANE_SPLIT_WITH_KEY,
  (splitCount, flexDirection = 'row') => ({splitCount, flexDirection})
)

export const PANE_SPLIT = 'PANE_SPLIT'
export const splitTo = promiseActionMixin(
  createAction(PANE_SPLIT, (paneId, splitDirection) => ({paneId, splitDirection}))
)

export const PANE_UPDATE = 'PANE_UPDATE'
export const updatePane = createAction(PANE_UPDATE)

export const PANE_CLOSE = 'PANE_CLOSE'
export const closePane = (paneId) => {
  return (dispatch, getState) => {
    const { PaneState, TabState } = getState()
    const content = PaneState.panes[paneId].content
    let tabIds = TabState.tabGroups[content.id].tabIds
    let siblingPane
    if (tabIds.length) {
      siblingPane = getPrevSibling(PaneState, paneId, true, true)
      if (!siblingPane) siblingPane = getNextSibling(PaneState, paneId, true, true)
    }

    dispatch({
      type: PANE_CLOSE,
      payload: {
        paneId: paneId,
        sourceTabGroupId: content.id,
        targetTabGroupId: siblingPane ? siblingPane.content.id : null
      }
    })
  }
}
