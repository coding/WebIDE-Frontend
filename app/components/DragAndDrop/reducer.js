/* @flow weak */
import _ from 'lodash'
import {
  DND_DRAG_START,
  DND_DRAG_OVER,
  DND_DRAG_END
} from './actions'

function getDroppables () {
  var droppables = {}
  _.forEach(document.querySelectorAll('[data-droppable]'), (elem) => {
    droppables[elem.id] = {
      id: elem.id,
      element: elem,
      rect: elem.getBoundingClientRect()
    }
  })
  return droppables
}

export default function DragAndDropReducer (state={}, action) {
  switch (action.type) {
    case DND_DRAG_START:
      var {sourceType, sourceId} = action.payload
      return {
        sourceType,
        sourceId,
        isDragging: true,
        droppables: getDroppables()
      }

    case DND_DRAG_OVER:
      return {
        ...state,
        paneLayoutOverlay: action.payload.paneLayoutOverlay
      }

    case DND_DRAG_END:
      return {...state, ...action.payload, isDragging: false}

    default:
      return state
  }
}
