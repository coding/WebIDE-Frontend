/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  PANE_UPDATE,
  PANE_RESIZE,
  PANE_SPLIT,
  PANE_SPLIT_WITH_KEY
} from './actions'
import {
  getPaneById,
  getParent,
  getNextSibling,
} from './selectors'
const debounced = _.debounce(func => func(), 50)

/*
Pane.propTypes = {
  id: PropTypes.string,
  flexDirection: PropTypes.string,
  size: PropTypes.number,
  parentId: PropTypes.string,
  views: PropTypes.arrayOf(PropTypes.string),
  tabGroupId: PropTypes.string
}
*/

const Pane = (paneConfig) => {
  const defaults = {
    id: _.uniqueId('pane_view_'),
    flexDirection: 'row',
    size: 100,
    views: [],
    parentId: '',
    tabGroupId: '',
  }

  return { ...defaults, ...paneConfig }
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
      newPane = Pane({views: [''], parentId: parent.id})
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
      let curTabGroupId = pane.views.pop()
      let spawnKid = Pane({views: [curTabGroupId], parentId: pane.id})
      newPane = Pane({views: [''], parentId: pane})
      if (splitDirection === 'right' || splitDirection === 'bottom') {
        pane.views = [spawnKid.id, newPane.id]
      } else {
        pane.views = [newPane.id, spawnKid.id]
      }
      action.meta.resolve(newPane.id)
      return {
        ...state,
        panes: {
          ...state.panes,
          [newPane.id]: newPane,
          [pane.id]: pane,
          [spawnKid.id]: spawnKid,
        }
      }
      // let { _state, _pane, _childPane } = spawnChildInPane(state, pane)
      // newPane = Pane({views: ['']}, _pane)
      // action.meta.resolve(newPane.id)
      // if (splitDirection === 'right' || splitDirection === 'bottom') {
      //   return addSiblingAfterPane(_state, _childPane, newPane)
      // } else {
      //   return addSiblingBeforePane(_state, _childPane, newPane)
      // }
    }
  }
}, defaultState)

const convertContentChildToPane = (state, paneId) => {
  if (typeof paneId !== 'string') paneId = paneId.id
  let pane = state.panes[paneId]

  if (pane.views.length > 1) return state
  if (pane.views.length === 0 ) throw `Abnormal pane! Pane.id=${pane.id} has zero children`

  const contentId = pane.views[0]
  if (contentId.startsWith('pane_view')) return state

  const childPane = Pane({views: [contentId], parentId: pane.id})
  pane = Pane({...pane, views: [childPane.id]})
  return {
    ...state,
    panes: {
      ...state.panes,
      [pane.id]: pane,
      [childPane.id]: childPane
    }
  }
}

const addChildToPane = (state, paneId, numToAdd=1) => {
  if (numToAdd <= 0) return state
  if (typeof paneId !== 'string') paneId = paneId.id
  let pane = state.panes[paneId]
  let nextState

  if (pane.views.length === 1 && !pane.views[0].startsWith('pane_view')) {
    nextState = convertContentChildToPane(state, paneId)
  } else {
    nextState = {...state, panes: {...state.panes}}
  }

  pane = nextState.panes[paneId]
  while (numToAdd--) {
    let childPane = Pane({views: [''], parentId: pane.id})
    pane.views.push(childPane.id)
    nextState.panes[childPane.id] = childPane
  }
  nextState.panes[pane.id] = {...pane}
  return nextState
}

const addPanes = (state, paneId) => {}
const mergePanes = (state, paneId) => {}

const splitPane = (state, pane, splitCount) => {
  if (splitCount === pane.views.length) return []
  let tabGroupIdsToBeMerged = []
  let panesToBeRemoved = []
  let nextState

  if (splitCount > pane.views.length) { // add panes
    let increment = splitCount - pane.views.length
    nextState = addChildToPane(state, pane.id, increment)
  } else { // merge panes
    while (splitCount < pane.views.length) {
      let paneToBeMerged = pane.views.pop()
      panesToBeRemoved.concat(paneToBeMerged)
      tabGroupIdsToBeMerged = tabGroupIdsToBeMerged.concat(getTabGroupIds(state, paneToBeMerged))
    }
  }

  // removeSingleChildedInternalNode, and even the size
  if (pane.views.length === 1) {
    // let lonelyItem = pane.views[0]
    // if (lonelyItem.views && typeof lonelyItem.views[0] === 'string') {
    //   pane.views = lonelyItem.views
    // }
  } else {
    let baseSize = state.panes[pane.views[0]]['size']
    pane.views.forEach( paneId => state.panes[paneId].size = baseSize )
  }

  // handle tab groups merging
  let tabGroupIdToMergeInto = pane.views[pane.views.length - 1]
  if (tabGroupIdToMergeInto.startsWith('pane_view')) {
    tabGroupIdToMergeInto = getTabGroupIds(state, tabGroupIdToMergeInto)[0]
  }

  // then we're going to merge tab group from right to left
  return {
    tabGroupIds: [tabGroupIdToMergeInto].concat(tabGroupIdsToBeMerged),
    panesToBeRemoved
  }

}

const getTabGroupIds = (state, paneId) => {
  if (typeof paneId !== 'string') paneId = paneId.id
  let pane = state.panes[paneId]
  return pane.views.reduceRight((acc, viewId) => {
    if (viewId.startsWith('tab_')) {
      return acc.concat(viewId)
    } else {
      return acc.concat(getTabGroupIds(state, state.panes[viewId]))
    }
  }, [])
}

export const PaneCrossReducer = handleActions({
  [PANE_SPLIT_WITH_KEY]: (allStates, action) => {
    const { PaneState, TabState } = allStates
    const { splitCount, flexDirection } = action.payload
    let pane = PaneState.panes[PaneState.rootPaneId]

    if (splitCount === pane.views.length &&
      flexDirection === pane.flexDirection) {
      return allStates
    }

    var tabGroupIds = splitPane(PaneState, pane, splitCount)
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
  },
})

