/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
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

export default handleActions({
  [DND_DRAG_START]: (state, action) => {
    const {sourceType, sourceId} = action.payload
    return {
      isDragging: true,
      source: {
        type: sourceType,
        id: sourceId
      },
      droppables: getDroppables()
    }
  },

  [DND_DRAG_OVER]: (state, action) => {
    return {
      ...state,
      target: action.payload
    }
  },

  [DND_UPDATE_DRAG_OVER_META]: (state, action) => {
    return {
      ...state,
      meta: action.payload
    }
  },

  [DND_DRAG_END]: (state, action) => {
    return {isDragging: false}
  }
}, {isDragging: false})


/*
@StateShape:
{
  isDragging: <Boolean>
  source: {
    id:
    type:
  }
  target: {
    id:
    type:
  }
}
*/
