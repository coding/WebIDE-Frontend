/* @flow weak */
import _ from 'lodash'
import { update, Model } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  TAB_CREATE,
  TAB_REMOVE,
  TAB_ACTIVATE,
  TAB_CREATE_GROUP,
  TAB_REMOVE_GROUP,
  TAB_UPDATE,
  TAB_UPDATE_FLAGS,
  TAB_MOVE_TO_GROUP,
  TAB_MOVE_TO_PANE,
  TAB_INSERT_AT
} from './actions'

import {
  getTabGroupOfTab,
  getNextSiblingOfTab,
  getActiveTabGroup,
  getActiveTabOfTabGroup,
  getActiveTab,
  isActive,
} from './selectors'


const defaultState = {
  tabGroups: {},
  tabs: {},
  activeTabGroupId: ''
}
let __state__ = defaultState

const Tab = Model({
  id: '',
  flags: {},
  icon: 'fa fa-folder-',
  title: 'untitled',
  path: '',
  content: '',
  tabGroupId: ''
})

const TabGroup = Model({
  id: '',
  tabIds: [],
  type: '', // default content type
  activeTabId: ''
})

const activateTabGroup = (state, tabGroup) => {
  if (isActive(state, tabGroup)) return state
  return update(state, {
    activeTabGroupId: {$set: tabGroup.id}
  })
}

const activateTab = (state, tab) => {
  if (!tab) return state
  const tabGroup = getTabGroupOfTab(state, tab)
  if (isActive(state, tab) && isActive(state, tabGroup)) return state

  let nextState = update(state, {
    tabGroups: {[tabGroup.id]: {activeTabId: {$set: tab.id}}}
  })
  return activateTabGroup(nextState, tabGroup)
}

const removeTab = (state, tab) => {
  let nextState = state
  if (isActive(state, tab)) { /* activateNextTab */
    let nextTab = getNextSiblingOfTab(state, tab)
    if (nextTab) nextState = activateTab(state, nextTab)
  }

  return update(nextState, {
    tabGroups: {
      [tab.tabGroupId]: {
        tabIds: {$removeValue: tab.id}
      }
    },
    tabs: {$delete: tab.id}
  })
}

const moveTabToGroup = (state, tab, tabGroup, insertIndex = tabGroup.tabIds.length) => {
  // 1. remove it from original group
  let nextState = removeTab(state, tab)
  if (tabGroup.id === tab.tabGroupId) tabGroup = nextState.tabGroups[tabGroup.id]
  // 2. add it to new group
  tab = update(tab, {tabGroupId: {$set: tabGroup.id}})
  let tabIds = tabGroup.tabIds.slice()
  tabIds.splice(insertIndex, 0 , tab.id)

  nextState = update(nextState, {
    tabGroups: {[tabGroup.id]: {tabIds: {$set: tabIds}}},
    tabs: {[tab.id]: {$set: tab}}
  })

  return activateTab(nextState, tab)
}

const TabReducer = handleActions({

  [TAB_CREATE]: (state, action) => {
    const { groupId, tab: tabConfig } = action.payload
    const newTab = Tab({
      id: _.uniqueId('tab_'),
      tabGroupId: groupId,
      ...tabConfig
    })

    let tabGroup = state.tabGroups[groupId]
    let nextState = update(state, {
      tabs: {[newTab.id]: {$set: newTab}},
      tabGroups: {[tabGroup.id]: {tabIds: {$push: [newTab.id]}}}
    })
    nextState = activateTab(nextState, newTab)

    return nextState
  },


  [TAB_REMOVE]: (state, action) => {
    const tab = state.tabs[action.payload]
    return removeTab(state, tab)
  },


  [TAB_ACTIVATE]: (state, action) => {
    const tab = state.tabs[action.payload]
    let nextState = activateTab(state, tab)
    return nextState
  },


  [TAB_CREATE_GROUP]: (state, action) => {
    const {groupId, defaultContentType} = action.payload
    const newTabGroup = TabGroup({ id: groupId, type: defaultContentType })
    let nextState = update(state,{
      tabGroups: {[newTabGroup.id]: {$set: newTabGroup}}
    })
    nextState = activateTabGroup(nextState, newTabGroup)
    return nextState
  },


  [TAB_REMOVE_GROUP]: (state, action) => {
    // 还有 group active 的问题
    return update(state, {
      tabGroups: {$delete: action.payload}
    })
  },


  [TAB_UPDATE]: (state, action) => {
    const tabConfig = action.payload
    return update(state, {
      tabs: {[tabConfig.id]: {$merge: tabConfig}}
    })
  },


  [TAB_UPDATE_FLAGS]: (state, action) => {
    const {tabId, flags} = action.payload
    return update(state, {
      tabs: {[tabId]: {
        flags: {$merge: flags}
      }}
    })
  },


  [TAB_MOVE_TO_GROUP]: (state, action) => {
    const {tabId, groupId} = action.payload
    return moveTabToGroup(state, state.tabs[tabId], state.tabGroups[groupId])
  },


  [TAB_INSERT_AT]: (state, action) => {
    const { tabId, beforeTabId } = action.payload
    const sourceTab = state.tabs[tabId]
    const targetTabGroup = getTabGroupOfTab(state, state.tabs[beforeTabId])
    const insertIndex = targetTabGroup.tabIds.indexOf(beforeTabId)
    return moveTabToGroup(state, sourceTab, targetTabGroup, insertIndex)
  }
}, defaultState)


export default (state, action) => (__state__ = TabReducer(state, action))

export const TabCrossReducer = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, { payload: { tabId, paneId }}) => {
    const { PaneState, TabState } = allState
    const pane = PaneState.panes[paneId]
    const tabGroup = TabState.tabGroups[pane.content.id]
    const tab = TabState.tabs[tabId]

    return {
      ...allState,
      TabState: moveTabToGroup(TabState, tab, tabGroup)
    }
  }
})

/**
 * The state shape:
 *
 *  TabState: {
      tabGroups: {
        [tab_group_id <String>]: {
          id:         <String>
          type:       <String>
          isActive:   <Boolean>
        }
      },
      tabs: {
        [tab_id <String>]: {
          id:       <String>
          flags:    <Object>
          icon:     <String>
          title:    <String>
          isActive: <Boolean>
          path:     <String>
          content:  <String>
          groupId:  <String>
        }
      }
    }
 */
