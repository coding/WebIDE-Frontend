import { extendObservable } from 'mobx'
import { createAction, handleActions } from 'utils/actions'
import EditorTabState, { Tab, TabGroup } from './state'
import store from 'mobxStore'

export const TAB_DISSOLVE_GROUP = 'TAB_DISSOLVE_GROUP'

export const TAB_CREATE = 'TAB_CREATE'
export const createTab = createAction(TAB_CREATE, tab => tab)

export const TAB_CREATE_IN_GROUP = 'TAB_CREATE_IN_GROUP'
export const createTabInGroup = createAction(TAB_CREATE_IN_GROUP, (groupId, tab) => ({groupId, tab}))

export const TAB_REMOVE = 'TAB_REMOVE'
export const removeTab = createAction(TAB_REMOVE, tabId => tabId)

export const TAB_REMOVE_OTHER = 'TAB_REMOVE_OTHER'
export const removeOtherTab = createAction(TAB_REMOVE_OTHER, tabId => tabId)

export const TAB_REMOVE_ALL = 'TAB_REMOVE_ALL'
export const removeAllTab = createAction(TAB_REMOVE_ALL, tabId => tabId)

export const TAB_ACTIVATE = 'TAB_ACTIVATE'
export const activateTab = createAction(TAB_ACTIVATE, tabId => tabId)

export const TAB_CREATE_GROUP = 'TAB_CREATE_GROUP'
export const createGroup = createAction(TAB_CREATE_GROUP,
  (groupId, defaultContentType) => ({groupId, defaultContentType})
)

export const TAB_REMOVE_GROUP = 'TAB_REMOVE_GROUP'
export const removeGroup = createAction(TAB_REMOVE_GROUP, groupId => groupId)

export const TAB_UPDATE = 'TAB_UPDATE'
export const updateTab = createAction(TAB_UPDATE, (tabConfig = {}) => tabConfig)

export const TAB_UPDATE_BY_PATH = 'TAB_UPDATE_BY_PATH'
export const updateTabByPath = createAction(TAB_UPDATE_BY_PATH, (tabConfig = {}) => tabConfig)

export const TAB_UPDATE_FLAGS = 'TAB_UPDATE_FLAGS'
export const updateTabFlags = (tabId, flag, value = true) => {
  if (!tabId) return
  var payload = { tabId }

  if (typeof flag === 'string') {
    payload.flags = {[flag]: value}
  } else if (typeof flag === 'object') {
    payload.flags = flag
  } else {
    return
  }

  return {
    type: TAB_UPDATE_FLAGS,
    payload
  }
}

export const TAB_MOVE_TO_GROUP = 'TAB_MOVE_TO_GROUP'
export const moveTabToGroup = createAction(TAB_MOVE_TO_GROUP,
  (tabId, groupId) => ({tabId, groupId})
)

export const TAB_MOVE_TO_PANE = 'TAB_MOVE_TO_PANE'
export const moveTabToPane = createAction(TAB_MOVE_TO_PANE,
  (tabId, paneId) => ({tabId, paneId})
)

export const TAB_INSERT_AT = 'TAB_INSERT_AT'
export const insertTabAt = createAction(TAB_INSERT_AT,
  (tabId, beforeTabId) => ({tabId, beforeTabId})
)

export const TAB_CONTEXT_MENU_OPEN = 'TAB_CONTEXT_MENU_OPEN'
export const openContextMenu = createAction(TAB_CONTEXT_MENU_OPEN, (e, node, tabGroupId) => {
  e.stopPropagation()
  e.preventDefault()

  return {
    isActive: true,
    pos: { x: e.clientX, y: e.clientY },
    contextNode: node,
    tabGroupId
  }
})

export const TAB_CONTEXT_MENU_CLOSE = 'TAB_CONTEXT_MENU_CLOSE'
export const closeContextMenu = createAction(TAB_CONTEXT_MENU_CLOSE)

const TabActionHandler = handleActions({
  [TAB_CREATE]: (state, payload) => {
    const tabConfig = payload
    const tab = new Tab(tabConfig)
    const activeTabGroup = state.activeTabGroup
    activeTabGroup.addTab(tab)
  },

  [TAB_CREATE_IN_GROUP]: (state, payload) => {
    const { groupId, tab: tabConfig } = payload
    const tab = new Tab(tabConfig)
    state.tabGroups.get(groupId).addTab(tab)
  },

  [TAB_REMOVE]: (state, payload) => {
    const tab = state.tabs.get(payload)
    tab.destroy()
  },

  [TAB_ACTIVATE]: (state, payload) => {
    const tab = state.tabs.get(payload)
    tab.activate()
  },

  [TAB_REMOVE_OTHER]: (state, payload) => {
    const tab = state.tabs.get(payload)
    tab.activate()
    tab.tabGroup.tabs.forEach(eachTab => {
      if (eachTab !== tab) eachTab.destroy()
    })
  },

  [TAB_REMOVE_ALL]: (state, payload) => {
    const tab = state.tabs.get(payload)
    tab.tabGroup.tabs.forEach(tab => tab.destroy())
  },

  [TAB_CREATE_GROUP]: (state, payload) => {
    const { groupId } = payload
    new TabGroup({ id: groupId })
  },

  [TAB_REMOVE_GROUP]: (state, payload) => {
    const tab = state.tabs.get(payload)
  },

  [TAB_UPDATE]: (state, payload) => {
    const tabId = payload.id
    const tab = state.tabs.get(tabId)
    if (tab) extendObservable(tab, payload)
  },

  [TAB_UPDATE_FLAGS]: (state, { tabId, flags }) => {
    const tab = state.tabs.get(tabId)
    tab.flags = flags
  },

  [TAB_MOVE_TO_GROUP]: (state, { tabId, groupId }) => {
    const tab = state.tabs.get(tabId)
    const tabGroup = state.tabGroups.get(groupId)
    if (!tab || !tabGroup) return
    tabGroup.addTab(tab)
  },

  [TAB_INSERT_AT]: (state, { tabId, beforeTabId }) => {
    const tab = state.tabs.get(tabId)
    const anchorTab = state.tabs.get(beforeTabId)
    const prev = anchorTab.prev
    const insertIndex = (prev) ? (anchorTab.index + prev.index) / 2 : -1
    tab.tabGroup.addTab(tab, insertIndex)
  },

  ['TAB_GIT_BLAME']: (state, { tabId }) => {

  }
}, EditorTabState)

const crossActionHandlers = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, { tabId, paneId }) => {
    const pane = allState.PaneState.panes.get(paneId)
    const tab = allState.EditorTabState.tabs.get(tabId)
    tab.tabGroup.removeTab(tab)
    pane.tabGroup.addTab(tab)
    return allState
  }
}, store)

