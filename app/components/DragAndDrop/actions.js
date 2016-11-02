/* @flow weak */
import { createAction } from 'redux-actions'

export const DND_DRAG_START = 'DND_DRAG_START'
export const dragStart = createAction(DND_DRAG_START,
  ({sourceType, sourceId}) => ({sourceType, sourceId})
)

export const DND_DRAG_OVER = 'DND_DRAG_OVER'
export const dragOverTarget = createAction(DND_DRAG_OVER, target => target)

export const DND_UPDATE_DRAG_OVER_META = 'DND_UPDATE_DRAG_OVER_META'
export const updateDragOverMeta = createAction(DND_UPDATE_DRAG_OVER_META, meta => meta)

export const DND_DRAG_END = 'DND_DRAG_END'
export const dragEnd = createAction(DND_DRAG_END)
