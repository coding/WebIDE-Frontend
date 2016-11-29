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
  TAB_INSERT_AT
} from './actions'

import {
  getTabGroupOfTab,
  getNextSiblingOfTab,
  getActiveTabGroup,
  getActiveTabOfTabGroup,
  getActiveTab,
} from './selectors'

const Tab = Record({
  id: '',
  flags: {},
  icon: 'fa fa-folder-',
  title: 'untitled',
  isActive: true,
  path: '',
  content: '',
  tabGroupId: ''
})

const TabGroup = Record({
  id: '',
  tabIds: List(),
  type: '', // default content type
  isActive: true
})

const _state = {
  tabGroups: Map(),
  tabs: Map(),
  tabGroupIds: []
}



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

export default handleActions({
  [TAB_CREATE]: (state, action) => {
    const { groupId, tab: tabConfig } = action.payload
    let tabGroups = state.tabGroups.asMutable()
    let tabs = state.tabs.asMutable()

    const newTab = new Tab({
      id: _.uniqueId('tab_'),
      tabGroupId: groupId,
      ...tabConfig
    })

    // if the tabGroup that's gonna contain the newly create tab isn't currently active,
    // then we set the currently active tabGroup to inactive
    // cuz we are gonna activate THIS tabGroup instead
    let tabGroup = tabGroups.get(groupId)
    if (!tabGroup.isActive) {
      const curActiveTabGroup = getActiveTabGroup(state)
      tabGroups.set(curActiveTabGroup.id, curActiveTabGroup.set('isActive', false))
    }

    const curActiveTab = getActiveTabOfTabGroup(state, tabGroup)
    if (curActiveTab) {
      tabs.set(curActiveTab.id, curActiveTab.set('isActive', false))
    }

    tabGroup = tabGroup.withMutations(_tabGroup =>
      _tabGroup
        .set('isActive', true)
        .update('tabIds', _tabIds => _tabIds.push(newTab.id))
    )

    return {
      ...state,
      tabGroups: tabGroups.set(tabGroup.id, tabGroup).asImmutable(),
      tabs: tabs.set(newTab.id, newTab).asImmutable()
    }
  },

  [TAB_REMOVE]: (state, action) => {
    const tab = state.tabs.get(action.payload)
    return removeTab(state, tab)
  },

  [TAB_ACTIVATE]: (state, action) => {
    const tab = state.tabs.get(action.payload)
    return activateTab(state, tab)
  },

  [TAB_CREATE_GROUP]: (state, action) => {
    const {groupId, defaultContentType} = action.payload
    const curActiveTabGroup = getActiveTabGroup(state)
    const newTabGroup = new TabGroup({ id: groupId, type: defaultContentType })
    return {
      ...state,
      tabGroups: state.tabGroups.withMutations(_tabGroups => {
        if (curActiveTabGroup) {
          _tabGroups.update(
            curActiveTabGroup.id, tabGroup => tabGroup.set('isActive', false)
          )
        }
        _tabGroups.set(newTabGroup.id, newTabGroup)
        return _tabGroups
      })
    }
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
    let sourceTab = state.tabs.get(tabId).asMutable()
    let nextState = state
    if (sourceTab.isActive) {
      let nextTab = getNextSiblingOfTab(state, sourceTab)
      nextState = activateTab(state, nextTab)
    }
    nextState = removeTab(nextState, sourceTab)

    // 2. add it to new group
    let targetTabGroup = state.tabGroups.get(groupId)
    const tabIds = targetTabGroup.tabIds
    if (sourceTab.isActive) sourceTab.set('isActive', false)
    sourceTab.set('tabGroupId', targetTabGroup.id)
    targetTabGroup = targetTabGroup.set('tabIds', tabIds.push(tabId))

    sourceTab = sourceTab.asImmutable()
    nextState = {
      ...nextState,
      tabGroups: nextState.tabGroups.set(targetTabGroup.id, targetTabGroup),
      tabs: nextState.tabs.set(sourceTab.id, sourceTab)
    }

    return activateTab(nextState, sourceTab)
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
}, _state)

/**
 * The state shape:
 *
 *  TabState: {
      tabGroups: {
        [tab_group_id <String>]: {
          id:         <String>
          type:       <String>
          isActive:   <Boolean>
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
      }
    }
 */
