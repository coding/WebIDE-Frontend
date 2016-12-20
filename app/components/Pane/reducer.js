/* @flow weak */
import _ from 'lodash'
import { update } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  PANE_UPDATE,
  PANE_SPLIT,
  PANE_SPLIT_WITH_KEY,
  PANE_CLOSE,
  PANE_CONFIRM_RESIZE,
} from './actions'
import {
  getPaneById,
  getParent,
  getNextSibling,
  getPrevSibling,
  getPanesWithPosMap,
} from './selectors'
const debounced = _.debounce(func => func(), 50)

/**
 *  The state shape:
 *
 *  PaneState = {
      rootPaneId: PropTypes.string,
      panes: {
        [pane_id]: {
          id: PropTypes.string,
          flexDirection: PropTypes.string,
          size: PropTypes.number,
          parentId: PropTypes.string,
          views: PropTypes.arrayOf(PropTypes.string),
          content: PropTypes.shape({
            type: PropTypes.string,
            id: PropTypes.string,
          })
        }
      }
    }
*/

const Pane = (paneConfig) => {
  const defaults = {
    id: _.uniqueId('pane_view_'),
    flexDirection: 'row',
    size: 100,
    views: [],
    parentId: '',
    content: undefined,
  }

  return { ...defaults, ...paneConfig }
}

const rootPane = Pane({
  id: 'pane_view_1',
  flexDirection: 'row',
  size: 100,
  views: [],
  content: {
    type: 'tabGroup',
    id: ''
  }
})
const defaultState = {
  panes: {
    [rootPane.id]: rootPane
  },
  rootPaneId: rootPane.id
}

const _addSiblingAfterPane = (state, pane, siblingPane) => _addSibling(state, pane, siblingPane, 1)
const _addSiblingBeforePane = (state, pane, siblingPane) => _addSibling(state, pane, siblingPane, -1)
const _addSibling = (state, pane, siblingPane, indexOffset) => {
  let parent = getParent(state, pane)
  let atIndex = parent.views.indexOf(pane.id) + indexOffset
  parent.views.splice(atIndex, 0, siblingPane.id)

  return update(state, {
    panes: {
      [parent.id]: {$set: {...parent}},
      [siblingPane.id]: {$set: siblingPane}
    }
  })
}

function _hoistSingleChild (state, parent) {
  if (parent.views.length != 1) return state
  const singleChild = state.panes[parent.views[0]]
  if (singleChild.views.length > 0) {
    parent = update(parent, {
      views: {$set: singleChild.views},
      flexDirection: {$set: singleChild.flexDirection}
    })
  } else {
    parent = update(parent, {
      views: {$set: []},
      content: {$set: singleChild.content}
    })
  }
  let nextState = update(state, {panes: {[parent.id]: {$set: parent}}})
  nextState = update(nextState, {panes: {$delete: singleChild.id}})
  return _hoistSingleChild(nextState, parent)
}

export default handleActions({
  [PANE_UPDATE]: (state, action) => {
    const { id: paneId, tabGroupId } = action.payload
    let pane = getPaneById(state, paneId)

    return update(state, {
      panes: {[pane.id]: {content: {id: {$set: tabGroupId}}}}
    })
  },

  [PANE_SPLIT]: (state, action) => {
    const { paneId, splitDirection } = action.payload
    let pane = getPaneById(state, paneId)
    /* ----- */
    let flexDirection, newPane
    if (splitDirection === 'center') {
      // no pane arrangement changed, so no state change
      action.meta.resolve(pane.id)
      return state
    }
    switch (splitDirection) {
      case 'right':
      case 'left':
        flexDirection = 'row'
        break
      case 'top':
      case 'bottom':
        flexDirection = 'column'
        break
      default:
        throw 'Pane.splitToDirection method requires param "splitDirection"'
    }

    let parent = getParent(state, pane)
    // If flexDirection is same as parent's,
    // then we can simply push the newly splitted view into parent's "views" array
    if (parent && parent.flexDirection === flexDirection) {
      newPane = Pane({ parentId: parent.id, content: {type: 'tabGroup'} })
      action.meta.resolve(newPane.id)
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        return _addSiblingAfterPane(state, pane, newPane)
      } else {
        return _addSiblingBeforePane(state, pane, newPane)
      }

    // If flexDirection is NOT the same as parent's,
    // that means we should spawn a child pane
    } else {
      pane = {...pane, flexDirection}
      let spawnedChild = Pane({parentId: pane.id, content: {...pane.content}})
      delete pane.content
      newPane = Pane({ parentId: pane.id, content: {type: 'tabGroup'} })
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        pane.views = [spawnedChild.id, newPane.id]
      } else {
        pane.views = [newPane.id, spawnedChild.id]
      }
      action.meta.resolve(newPane.id)

      return update(state, {
        panes: {
          [newPane.id]: {$set: newPane},
          [pane.id]: {$set: pane},
          [spawnedChild.id]: {$set: spawnedChild},
        }
      })
    }
  },

  [PANE_CLOSE]: (state, action) => {
    const { paneId, targetTabGroupId, sourceTabGroupId } = action.payload
    let parent = getParent(state, paneId)
    let nextState = state

    // the `mergeTabGroups` part of the action is handled inside `Tab/reducer.js`
    parent = update(parent, {views: {$without: paneId}})
    nextState = update(nextState, {panes: {[parent.id]: {$set: parent}}})
    nextState = _hoistSingleChild(nextState, parent)
    parent = nextState.panes[parent.id]

    nextState = update(nextState, {panes: {[parent.id]: {$set: parent}}})
    nextState = update(nextState, {panes: {$delete: paneId}})
    return nextState
  },

  [PANE_CONFIRM_RESIZE]: (state, { payload: { leftView, rightView } }) => {
    return update(state, {
      panes: {
        [leftView.id]: { size: { $set: leftView.size } },
        [rightView.id]: { size: { $set: rightView.size } },
      }
    })
  }
}, defaultState)


export const PaneCrossReducer = handleActions({
  [PANE_SPLIT_WITH_KEY]: (allStates, action) => {
    return allStates
    // const { PaneState, TabState } = allStates
    // const { splitCount, flexDirection } = action.payload
    // let rootPane = PaneState.panes[PaneState.rootPaneId]

    // if (
    //   (splitCount === rootPane.views.length && flexDirection === rootPane.flexDirection) ||
    //   (splitCount === 1 && rootPane.views.length === 0 && rootPane.content)
    // ) {
    //   return allStates
    // }

    // // if rootPane has children
    // if (rootPane.views.length) {

    //   if (splitCount > rootPane.views.length) {
    //     // this is the easier case where we simply increase panes
    //     rootPane.views

    //   } else {
    //     // this is the harder case where we need to merge tabGroups

    //   }
    // }
  }
})








