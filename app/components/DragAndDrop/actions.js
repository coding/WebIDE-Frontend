/* @flow weak */
export const DND_DRAG_START = 'DND_DRAG_START'
export function dragStart ({sourceType, sourceId}) {
  return {
    type: DND_DRAG_START,
    payload: {sourceType, sourceId}
  }
}

export const DND_DRAG_OVER = 'DND_DRAG_OVER'
export function dragOverTarget (payload) {
  return {
    type: DND_DRAG_OVER,
    payload: payload
  }
}

export const DND_UPDATE_DRAG_OVER_META = 'DND_UPDATE_DRAG_OVER_META'
export function updateDragOverMeta (payload) {
  return {
    type: DND_UPDATE_DRAG_OVER_META,
    payload: payload
  }
}

export const DND_DRAG_END = 'DND_DRAG_END'
export function dragEnd (payload) {
  return {
    type: DND_DRAG_END,
    payload: payload
  }
}
