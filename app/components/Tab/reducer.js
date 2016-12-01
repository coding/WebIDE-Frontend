/* @flow weak */
import _ from 'lodash'
import { Record, Map, List } from 'immutable'
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
} from './selectors'


const defaultState = {
  tabGroups: Map(),
  tabs: Map(),
  tabGroupIds: []
}
let __state__ = defaultState

const Tab = Record({
  id: '',
  flags: {},
  icon: 'fa fa-folder-',
  title: 'untitled',
  isActive: false,
  path: '',
  content: '',
  tabGroupId: ''
})

const TabGroup = Record({
  id: '',
  tabIds: List(),
  type: '', // default content type
  isActive: false
})

const activateTab = (state, tab) => {
  if (tab.isActive) return state
  let tabGroups = state.tabGroups.asMutable()
  let tabs = state.tabs.asMutable()

  const parentTabGroup = getTabGroupOfTab(state, tab)
  const curActiveTab = getActiveTabOfTabGroup(state, parentTabGroup)
  // deactivate currently active tab in parentTabGroup
  if (curActiveTab) {
    tabs.set(curActiveTab.id, curActiveTab.set('isActive', false))
  }
  tabs.set(tab.id, tab.set('isActive', true))

  // activate tabGroup that contains the latest active tab
  const curActiveTabGroup = getActiveTabGroup(state)
  if (!parentTabGroup.isActive) {
    tabGroups.set(curActiveTabGroup.id, curActiveTabGroup.set('isActive', false))
    tabGroups.set(parentTabGroup.id, parentTabGroup.set('isActive', true))
  }

  return {
    ...state,
    tabs: tabs.asImmutable(),
    tabGroups: tabGroups.asImmutable()
  }
}

const removeTab = (state, tab) => {
  let nextState = state
  if (tab.isActive) { /* activateNextTab */
    let nextTab = getNextSiblingOfTab(state, tab)
    nextState = activateTab(state, nextTab)
  }

  let tabGroups = nextState.tabGroups.asMutable()
  let tabs = nextState.tabs.asMutable()

  tabs.remove(tab.id)
  tabGroups.update(tab.tabGroupId, tabGroup =>
    tabGroup.update('tabIds', tabIds =>
      tabIds.filterNot(tabId => tabId === tab.id)
    )
  )
  return {
    ...state,
    tabGroups: tabGroups.asImmutable(),
    tabs: tabs.asImmutable()
  }
}

const activateTabGroup = (state, tabGroup) => {
  if (typeof tabGroup === 'string') tabGroup = state.tabGroups.get(tabGroup)
  if (tabGroup.isActive) return state
  return {
    ...state,
    tabGroups: state.tabGroups.map(_tabGroup => {
      if (_tabGroup === tabGroup) return _tabGroup.set('isActive', true)
      if (_tabGroup.isActive) return _tabGroup.set('isActive', false)
      return _tabGroup
    })
  }
}

const moveTabToGroup = (state, tab, tabGroup) => {
  let sourceTab = tab.asMutable()
  // 1. remove it from original group
  let nextState = state
  if (sourceTab.isActive) {
    let nextTab = getNextSiblingOfTab(state, sourceTab)
    nextState = activateTab(state, nextTab)
  }
  nextState = removeTab(nextState, sourceTab)

  // 2. add it to new group
  let targetTabGroup = tabGroup
  const tabIds = targetTabGroup.tabIds
  if (sourceTab.isActive) sourceTab.set('isActive', false)
  sourceTab.set('tabGroupId', targetTabGroup.id)
  targetTabGroup = targetTabGroup.set('tabIds', tabIds.push(sourceTab.id))

  sourceTab = sourceTab.asImmutable()
  nextState = {
    ...nextState,
    tabGroups: nextState.tabGroups.set(targetTabGroup.id, targetTabGroup),
    tabs: nextState.tabs.set(sourceTab.id, sourceTab)
  }

  return activateTab(nextState, sourceTab)
}

const TabReducer = handleActions({
  [TAB_CREATE]: (state, action) => {
    const { groupId, tab: tabConfig } = action.payload
    const newTab = new Tab({
      id: _.uniqueId('tab_'),
      tabGroupId: groupId,
      ...tabConfig
    })

    let tabGroup = state.tabGroups.get(groupId)
    tabGroup = tabGroup.withMutations(_tabGroup =>
      _tabGroup.update('tabIds', _tabIds => _tabIds.push(newTab.id))
    )

    let nextState = {
      ...state,
      tabs: state.tabs.set(newTab.id, newTab),
      tabGroups: state.tabGroups.set(tabGroup.id, tabGroup)
    }

    // nextState = activateTabGroup(nextState, tabGroup)
    nextState = activateTab(nextState, newTab)

    return nextState
  },

  [TAB_REMOVE]: (state, action) => {
    const tab = state.tabs.get(action.payload)
    return removeTab(state, tab)
  },

  [TAB_ACTIVATE]: (state, action) => {
    const tab = state.tabs.get(action.payload)
    let nextState = activateTab(state, tab)
    // nextState = activateTabGroup(nextState, tab.tabGroupId)
    return nextState
  },

  [TAB_CREATE_GROUP]: (state, action) => {
    const {groupId, defaultContentType} = action.payload
    const curActiveTabGroup = getActiveTabGroup(state)
    const newTabGroup = new TabGroup({ id: groupId, type: defaultContentType })
    let nextState = {
      ...state,
      tabGroups: state.tabGroups.set(newTabGroup.id, newTabGroup)
    }
    nextState = activateTabGroup(nextState, newTabGroup)
    return nextState
  },

  [TAB_REMOVE_GROUP]: (state, action) => {
    // 还有 group active 的问题
    return {
      ...state,
      tabGroups: state.tabGroups.remove(action.payload)
    }
  },

  [TAB_UPDATE]: (state, action) => {
    const tabConfig = action.payload
    return {
      ...state,
      tabs: state.tabs.update(tabConfig.id, tab => tab.merge(tabConfig))
    }
  },

  [TAB_UPDATE_FLAGS]: (state, action) => {
    const {tabId, flags} = action.payload
    return {
      ...state,
      tabs: state.tabs.update(tabId, tab => tab.update('flags', _flags => ({..._flags, ...flags})))
    }
  },

  [TAB_MOVE_TO_GROUP]: (state, action) => {
    const {tabId, groupId} = action.payload
    return moveTabToGroup(state, state.tabs.get(tabId), state.tabGroups.get(groupId))
  },

  [TAB_INSERT_AT]: (state, action) => {
    const {tabId, beforeTabId} = action.payload
    let sourceTab = state.tabs.get(tabId).asMutable()
    const targetTab = state.tabs.get(beforeTabId)
    // 1. remove sourceTab from original group
    let nextState = removeTab(state, sourceTab)

    // 2. add it to new group
    let targetTabGroup = getTabGroupOfTab(nextState, targetTab)
    const tabIds = targetTabGroup.tabIds
    if (sourceTab.isActive) sourceTab.set('isActive', false)
    sourceTab.set('tabGroupId', targetTabGroup.id)
    targetTabGroup = targetTabGroup.set('tabIds', tabIds.insert(tabIds.indexOf(beforeTabId), tabId))

    sourceTab = sourceTab.asImmutable()
    nextState = {
      ...nextState,
      tabGroups: nextState.tabGroups.set(targetTabGroup.id, targetTabGroup),
      tabs: nextState.tabs.set(sourceTab.id, sourceTab)
    }

    return activateTab(nextState, sourceTab)
  }
}, defaultState)


export default (state, action) => (__state__ = TabReducer(state, action))

export const TabCrossReducer = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, action) => {
    const { PaneState, TabState } = allState
    const { tabId, paneId } = action.payload
    const pane = PaneState.panes[paneId]

    const tab = TabState.tabs.get(tabId)
    const tabGroup = TabState.tabGroups.get(pane.views[0])
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
