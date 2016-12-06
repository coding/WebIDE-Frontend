/* @flow weak */
import _ from 'lodash'
import { update } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  PANE_UPDATE,
  PANE_RESIZE,
  PANE_SPLIT,
  PANE_SPLIT_WITH_KEY,
  closePane
} from './actions'
import {
  getPaneById,
  getParent,
  getNextSibling,
  getPanesWithPosMap,
} from './selectors'
const debounced = _.debounce(func => func(), 50)

/*
Pane.propTypes = {
  id: PropTypes.string,
  flexDirection: PropTypes.string,
  size: PropTypes.number,
  parentId: PropTypes.string,
  views: PropTypes.arrayOf(PropTypes.string),
  content: PropTypes.shape({
    type: PropTypes.string,
    id: PropTypes.string,
  }),
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

const addSiblingAfterPane = (state, pane, siblingPane) => addSibling(state, pane, siblingPane, 1)
const addSiblingBeforePane = (state, pane, siblingPane) => addSibling(state, pane, siblingPane, -1)
const addSibling = (state, pane, siblingPane, indexOffset) => {
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


export default handleActions({
  [PANE_UPDATE]: (state, action) => {
    const { id: paneId, tabGroupId } = action.payload
    let pane = getPaneById(state, paneId)

    return update(state, {
      panes: {[pane.id]: {content: {id: {$set: tabGroupId}}}}
    })
  },

  [PANE_RESIZE]: (state, action) => {
    const {sectionId, dX, dY} = action.payload
    let leftPane = getPaneById(state, sectionId)
    let rightPane = getNextSibling(state, leftPane)
    let leftPaneDom = document.getElementById(leftPane.id)
    let rightPaneDom = document.getElementById(rightPane.id)

    var r, rA, rB
    if (getParent(state, leftPane).flexDirection === 'column') {
      r = dY
      rA = leftPaneDom.offsetHeight
      rB = rightPaneDom.offsetHeight
    } else {
      r = dX
      rA = leftPaneDom.offsetWidth
      rB = rightPaneDom.offsetWidth
    }
    leftPane.size = leftPane.size * (rA - r) / rA
    rightPane.size = rightPane.size * (rB + r) / rB

    leftPaneDom.style.flexGrow = leftPane.size
    rightPaneDom.style.flexGrow = rightPane.size

    // @coupled: trigger resize of views ace editor
    debounced(() => {
      leftPaneDom.querySelectorAll('[data-ace-resize]').forEach(
        editorDOM => editorDOM.$ace_editor.resize()
      )
      rightPaneDom.querySelectorAll('[data-ace-resize]').forEach(
        editorDOM => editorDOM.$ace_editor.resize()
      )
    })
    return state
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
        return addSiblingAfterPane(state, pane, newPane)
      } else {
        return addSiblingBeforePane(state, pane, newPane)
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

  [closePane]: (state, action) => {
    const paneId = action.payload
    const parent = getParent(state, paneId)

    return update(state, {
      panes: {[parent.id]: {views: {$without: paneId}}}
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








