/* @flow weak */
export const DND_DRAG_START = 'DND_DRAG_START'
export function dragStart ({sourceType, sourceId}) {
  return {
    type: DND_DRAG_START,
    payload: {sourceType, sourceId}
  }
}

export const DND_DRAG_OVER = 'DND_DRAG_OVER'
export function dragOver (payload) {
  return {
    type: DND_DRAG_OVER,
    payload: payload
  }
}


export const DND_DRAG_END = 'DND_DRAG_END'
