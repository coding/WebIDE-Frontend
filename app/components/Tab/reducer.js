/* @flow weak */
import _ from 'lodash'
import { update, Model } from '../../utils'
import { handleActions } from 'redux-actions'
import {
  TAB_CREATE,
  TAB_CREATE_IN_GROUP,
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

/**
 * The state shape:
 *
 *  TabState: {
      activeTabGroupId: PropTypes.string,
      tabGroups: {
        [tab_group_id]: {
          id:     PropTypes.string,
          type:   PropTypes.string,
          tabIds: PropTypes.arrayOf(PropTypes.string),
          activeTabId: PropTypes.string
        }
      },
      tabs: {
        [tab_id]: {
          id:     PropTypes.string,
          flags:  PropTypes.object,
          icon:   PropTypes.string,
          title:  PropTypes.string,
          path:     PropTypes.string,
          content:  PropTypes.object,
          tabGroupId:  PropTypes.string
        }
      }
    }
*/

const defaultState = {
  tabGroups: {},
  tabs: {},
  activeTabGroupId: ''
}
let __state__ = defaultState

const Tab = Model({
  id: '',
  type: 'editor',
  flags: {},
  icon: 'fa fa-folder-',
  title: 'untitled',
  path: '',
  content: null,
  tabGroupId: ''
})

const TabGroup = Model({
  id: '',
  tabIds: [],
  type: 'editor', // default content type
  activeTabId: ''
})

const _activateTabGroup = (state, tabGroup) => {
  if (isActive(state, tabGroup)) return state
  return update(state, {
    activeTabGroupId: {$set: tabGroup.id}
  })
}

const _activateTab = (state, tab) => {
  if (!tab) return state
  const tabGroup = getTabGroupOfTab(state, tab)
  if (isActive(state, tab) && isActive(state, tabGroup)) return state

  let nextState = update(state, {
    tabGroups: {[tabGroup.id]: {activeTabId: {$set: tab.id}}}
  })
  return _activateTabGroup(nextState, tabGroup)
}

const _removeTab = (state, tab) => {
  let nextState = state
  if (isActive(state, tab)) { /* activateNextTab */
    let nextTab = getNextSiblingOfTab(state, tab)
    if (nextTab) nextState = _activateTab(state, nextTab)
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

const _moveTabToGroup = (state, tab, tabGroup, insertIndex = tabGroup.tabIds.length) => {
  // 1. remove it from original group
  let nextState = _removeTab(state, tab)
  if (tabGroup.id === tab.tabGroupId) tabGroup = nextState.tabGroups[tabGroup.id]
  // 2. add it to new group
  tab = update(tab, {tabGroupId: {$set: tabGroup.id}})
  let tabIds = tabGroup.tabIds.slice()
  tabIds.splice(insertIndex, 0 , tab.id)

  nextState = update(nextState, {
    tabGroups: {[tabGroup.id]: {tabIds: {$set: tabIds}}},
    tabs: {[tab.id]: {$set: tab}}
  })

  return _activateTab(nextState, tab)
}

const _createTabInGroup = (state, tabConfig, tabGroup) => {
  tabGroup = state.tabGroups[tabGroup.id]
  const newTab = Tab({
    id: _.uniqueId('tab_'),
    tabGroupId: tabGroup.id,
    ...tabConfig
  })
  let nextState = update(state, {
    tabs: {[newTab.id]: {$set: newTab}},
    tabGroups: {[tabGroup.id]: {tabIds: {$push: [newTab.id]}}}
  })
  return _activateTab(nextState, newTab)
}

const _mergeTabGroups = (state, targetTabGroupId, sourceTabGroupIds) => {
  if (!_.isArray(sourceTabGroupIds)) sourceTabGroupIds = [sourceTabGroupIds]
  let targetTabGroup = state.tabGroups[targetTabGroupId]
  let sourceTabGroups = sourceTabGroupIds.map(id => state.tabGroups[id])
  let tabIdsToBeMerged = sourceTabGroups.reduce((tabIds, tabGroup) => {
    return tabIds.concat(tabGroup.tabIds)
  }, [])
  let targetTabIds = targetTabGroup.tabIds.concat(tabIdsToBeMerged)
  let mergedTabs = tabIdsToBeMerged.reduce((tabs, tabId) => {
    tabs[tabId] = {...state.tabs[tabId], tabGroupId: targetTabGroup.id}
    return tabs
  }, {})
  let nextState = update(state, {
    tabGroups: {
      [targetTabGroup.id]: {tabIds: {$set: targetTabIds}}
    },
    tabs: {$merge: mergedTabs},
    activeTabGroupId: {$set: targetTabGroup.id}
  })
  return update(nextState, {tabGroups: {$delete: sourceTabGroupIds}})
}

const TabReducer = handleActions({

  [TAB_CREATE]:  (state, action) => {
    const tabConfig = action.payload
    // here we try our best to put the tab into the right group
    // first we try the current active group, check if it's of same type
    // if not, we try to find the group of same type as tab,
    // if can find none, well, we fallback to the current active group we found
    let tabGroup = getActiveTabGroup(state)
    if (tabGroup.type !== tabConfig.type) {
      let _tabGroup = _(state.tabGroups).find(g => g.type === tabConfig.type)
      if (_tabGroup) tabGroup = _tabGroup
    }
    return _createTabInGroup(state, tabConfig, tabGroup)
  },

  [TAB_CREATE_IN_GROUP]: (state, action) => {
    const { groupId, tab: tabConfig } = action.payload
    let tabGroup = state.tabGroups[groupId]
    return _createTabInGroup(state, tabConfig, tabGroup)
  },

  [TAB_REMOVE]: (state, action) => {
    const tab = state.tabs[action.payload]
    return _removeTab(state, tab)
  },

  [TAB_ACTIVATE]: (state, action) => {
    const tab = state.tabs[action.payload]
    let nextState = _activateTab(state, tab)
    return nextState
  },

  [TAB_CREATE_GROUP]: (state, action) => {
    const {groupId, defaultContentType} = action.payload
    const newTabGroup = TabGroup({ id: groupId, type: defaultContentType })
    let nextState = update(state,{
      tabGroups: {[newTabGroup.id]: {$set: newTabGroup}}
    })
    nextState = _activateTabGroup(nextState, newTabGroup)
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
    return _moveTabToGroup(state, state.tabs[tabId], state.tabGroups[groupId])
  },

  [TAB_INSERT_AT]: (state, action) => {
    const { tabId, beforeTabId } = action.payload
    const sourceTab = state.tabs[tabId]
    const targetTabGroup = getTabGroupOfTab(state, state.tabs[beforeTabId])
    const insertIndex = targetTabGroup.tabIds.indexOf(beforeTabId)
    return _moveTabToGroup(state, sourceTab, targetTabGroup, insertIndex)
  },

  'PANE_CLOSE': (state, action) => {
    const { targetTabGroupId, sourceTabGroupId } = action.payload
    if (!targetTabGroupId) return update(state, {tabGroups: {$delete: sourceTabGroupId}})
    return _mergeTabGroups(state, targetTabGroupId, sourceTabGroupId)
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
      TabState: _moveTabToGroup(TabState, tab, tabGroup)
    }
  }
})
