/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import * as Tab from '../Tab'
import {
  PANE_UPDATE,
  PANE_INITIALIZE,
  PANE_UNSET_COVER,
  PANE_RESIZE,
  PANE_CONFIRM_RESIZE,
  PANE_SPLIT,
  PANE_SPLIT_WITH_KEY
} from './actions'
const debounced = _.debounce(function (func) { func() }, 50)

const Pane = (paneConfig, parent) => {
  const defaults = {
    id: _.uniqueId('pane_view_'),
    flexDirection: 'row',
    size: 100,
    views: [],
    parentId: '',
  }

  const pane = { ...defaults, ...paneConfig }

  if (parent) pane.parentId = (typeof parent === 'string') ? parent : parent.id
  return pane
}

const rootPane = Pane({
  id: 'pane_view_1',
  flexDirection: 'row',
  size: 100,
  views: ['']
})
const defaultState = {
  panes: {
    [rootPane.id]: rootPane
  },
  rootPaneId: rootPane.id
}

const getPaneById = (state, id) => state.panes[id]
const getParent = (state, pane) => state.panes[pane.parentId]
const getNextSibling = (state, pane) => {
  let parent = getParent(state, pane)
  let nextSiblingId = parent.views[parent.views.indexOf(pane.id) + 1]
  return state.panes[nextSiblingId]
}

const addSiblingAfterPane = (state, pane, siblingPane) => addSibling(state, pane, siblingPane, 1)
const addSiblingBeforePane = (state, pane, siblingPane) => addSibling(state, pane, siblingPane, -1)
const addSibling = (state, pane, siblingPane, indexOffset) => {
  let parent = getParent(state, pane)
  let atIndex = parent.views.indexOf(pane.id) + indexOffset
  parent.views = [...parent.views].splice(atIndex, 0, siblingPane.id)

  return {
    ...state,
    panes: {
      ...state.panes,
      [parent.id]: {...parent},
      [siblingPane.id]: siblingPane
    }
  }
}

export default handleActions({
  [PANE_UPDATE]: (state, action) => {
    const { paneId, tabGroupId } = action.payload
    let pane = getPaneById(state, paneId)
    pane = {...pane, views: [tabGroupId]}
    return {
      ...state,
      panes: {
        ...state.panes,
        [pane.id]: pane
      }
    }
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
    debounced(function () {
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
    if (splitDirection === 'center') return this
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
      newPane = Pane({views: ['']}, parent)
      action.meta.resolve(newPane)
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        return addSiblingAfterPane(state, pane, newPane)
      } else {
        return addSiblingBeforePane(state, pane, newPane)
      }

    // If flexDirection is NOT the same as parent's,
    // that means we should spawn a child pane
    } else {
      pane = {...pane, flexDirection}
      let curTabGroupId = pane.views.pop()
      let spawnKid = Pane({views: [curTabGroupId]}, pane)
      newPane = Pane({views: ['']}, pane)
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        pane.views = [spawnKid.id, newPane.id]
      } else {
        pane.views = [newPane.id, spawnKid.id]
      }
      return {
        ...state,
        panes: {
          ...state.panes,
          [newPane.id]: newPane,
          [pane.id]: pane,
          [spawnKid.id]: spawnKid,
        }
      }
    }
  }
}, defaultState)


export const PaneCrossReducer = handleActions({
  [PANE_SPLIT_WITH_KEY]: (allStates, action) => {
    var {PaneState, TabState} = allStates
    var {pane, splitCount, flexDirection} = action.payload
    if (!pane) pane = PaneState.root

    if (splitCount === pane.views.length &&
      flexDirection === pane.flexDirection) {
      return allStates
    }

    pane = new Pane(pane)
    var tabGroupIds = pane.splitPane(splitCount, flexDirection)
    if (tabGroupIds.length > 1) {
      var tabGroupIdToMergeInto = tabGroupIds[0]
      var tabGroupIdsToBeMerged = tabGroupIds.slice(1)
      var tabIdsToBeMerged = tabGroupIdsToBeMerged.reduceRight((acc, tabGroupId) => {
        var tabGroup = TabState.tabGroups.get(tabGroupId)
        // tabGroup.deactivateAllTabsInGroup()
        if (!acc) return tabGroup.tabIds
        return tabGroup.tabIds.concat(acc)
      }, null)

      let mergerTabGroup = TabState.tabGroups.get(tabGroupIdToMergeInto).asMutable()
      let tabs = TabState.tabs.asMutable()
      let tabGroups = TabState.tabGroups.asMutable()
      tabIdsToBeMerged.forEach(tabId =>
        tabs.update(tabId, tab =>
          tab.set('isActive', false).set('tabGroupId', mergerTabGroup.id)
        )
      )
      mergerTabGroup.update('tabIds', tabIds => tabIds.concat(tabIdsToBeMerged))
      tabGroups.set(mergerTabGroup.id, mergerTabGroup.asImmutable())
      tabGroupIdsToBeMerged.forEach(tabGroupId => tabGroups.remove(tabGroupId))


      return { ...allStates,
        PaneState: {root: new Pane(pane)},
        TabState: {
          ...TabState,
          tabs: tabs.asImmutable(),
          tabGroups: tabGroups.asImmutable()
        }
      }
    } else {
      return { ...allStates,
        PaneState: {root: new Pane(pane)},
      }
    }
  }
})

