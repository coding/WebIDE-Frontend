/* @flow weak */
import _ from 'lodash'
import {
  DND_DRAG_START,
  DND_DRAG_OVER,
  DND_UPDATE_DRAG_OVER_META,
  DND_DRAG_END
} from './actions'

function getDroppables () {
  var droppables = _.map(document.querySelectorAll('[data-droppable]'), (DOMNode) => {
    return {
      id: DOMNode.id,
      DOMNode: DOMNode,
      type: DOMNode.getAttribute('data-droppable'),
      rect: DOMNode.getBoundingClientRect()
    }
  })
  return droppables
}

export default function DragAndDropReducer (state={isDragging: false}, action) {
  switch (action.type) {
    case DND_DRAG_START:
      var {sourceType, sourceId} = action.payload
      return {
        isDragging: true,
        source: {
          type: sourceType,
          id: sourceId
        },
        droppables: getDroppables()
      }

    case DND_DRAG_OVER:
      return {
        ...state,
        target: action.payload
      }

    case DND_UPDATE_DRAG_OVER_META:
      return {
        ...state,
        meta: action.payload
      }

    case DND_DRAG_END:
      return {isDragging: false}

    default:
      return state
  }
}
