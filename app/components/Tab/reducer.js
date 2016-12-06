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
} from './selectors'


const defaultState = {
  tabGroups: {},
  tabs: {}
}
let __state__ = defaultState

const Tab = Model({
  id: '',
  flags: {},
  icon: 'fa fa-folder-',
  title: 'untitled',
  isActive: false,
  path: '',
  content: '',
  tabGroupId: ''
})

const TabGroup = Model({
  id: '',
  tabIds: [],
  type: '', // default content type
  isActive: false
})

const activateTabGroup = (state, tabGroup) => {
  let tabGroupId = typeof tabGroup === 'string' ? tabGroup : tabGroup.id
  tabGroup = state.tabGroups[tabGroupId]

  if (tabGroup.isActive) return state

  return update(state, {
    tabGroups: {$map: _tabGroup => {
      if (_tabGroup === tabGroup) return {..._tabGroup, 'isActive': true}
      if (_tabGroup.isActive) return {..._tabGroup, 'isActive': false}
      return _tabGroup
    }}
  })
}

const activateTab = (state, tab) => {
  let tabId = typeof tab === 'string' ? tab : tab.id
  let { tabs, tabGroups } = state
  tab = state.tabs[tabId]

  if (tab.isActive) return state

  let nextState = state
  const tabGroup = getTabGroupOfTab(state, tab)
  const curActiveTab = getActiveTabOfTabGroup(state, tabGroup)
  // deactivate currently active tab in tabGroup
  if (curActiveTab) {
    nextState = update(nextState, {tabs: {[curActiveTab.id]: {isActive: {$set: false}}}})
  }

  nextState = update(nextState, {tabs: {[tab.id]: {isActive: {$set: true}}}})

  // activate tabGroup that contains the latest active tab
  if (!tabGroup.isActive) {
    nextState = activateTabGroup(nextState, tabGroup)
  }
  return nextState
}


const removeTab = (state, tab) => {
  let nextState = state
  if (tab.isActive) { /* activateNextTab */
    let nextTab = getNextSiblingOfTab(state, tab)
    nextState = activateTab(state, nextTab)
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

const moveTabToGroup = (state, tab, tabGroup) => {
  let sourceTab = tab
  // 1. remove it from original group
  let nextState = state
  if (sourceTab.isActive) {
    let nextTab = getNextSiblingOfTab(state, sourceTab)
    nextState = activateTab(state, nextTab)
  }
  nextState = removeTab(nextState, sourceTab)

  // 2. add it to new group
  let targetTabGroup = tabGroup

  nextState = update(nextState, {
    tabGroups: {[targetTabGroup.id]: {
      tabIds: {$push: [sourceTab.id]}
    }},
    tabs: {[sourceTab.id]: {
      $set: update(sourceTab, {
        isActive: {$set: true},
        tabGroupId: {$set: targetTabGroup.id}
      })
    }}
  })

  return activateTab(nextState, sourceTab)
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
      tabs: {[tabConfig.id]: {
        flags: {$merge: flags}
      }}
    })
  },


  [TAB_MOVE_TO_GROUP]: (state, action) => {
    const {tabId, groupId} = action.payload
    return moveTabToGroup(state, state.tabs[tabId], state.tabGroups[groupId])
  },


  [TAB_INSERT_AT]: (state, action) => {
    const {tabId, beforeTabId} = action.payload
    let sourceTab = state.tabs[tabId]
    const targetTab = state.tabs[beforeTabId]
    // 1. remove sourceTab from original group
    let nextState = removeTab(state, sourceTab)

    // 2. add it to new group
    let targetTabGroup = getTabGroupOfTab(nextState, targetTab)
    let tabIds = targetTabGroup.tabIds.slice()
    tabIds.splice(tabIds.indexOf(beforeTabId), 0, tabId)
    nextState = update(nextState, {
      tabGroups: {[targetTabGroup.id]: {
        tabIds: {$set: tabIds}
      }},
      tabs: {[sourceTab.id]: {
        isActive: {$set: false},
        tabGroupId: {$set: targetTabGroup.id}
      }}
    })

    return activateTab(nextState, sourceTab)
  }
}, defaultState)


export default (state, action) => (__state__ = TabReducer(state, action))

export const TabCrossReducer = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, action) => {
    const { PaneState, TabState } = allState
    const { tabId, paneId } = action.payload
    const pane = PaneState.panes[paneId]

    const tab = TabState.tabs[tabId]
    const tabGroup = TabState.tabGroups[pane.content.id]
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
