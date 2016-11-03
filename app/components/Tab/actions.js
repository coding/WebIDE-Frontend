/* @flow weak */
import { createAction } from 'redux-actions'

export const TAB_DISSOLVE_GROUP = 'TAB_DISSOLVE_GROUP'

export const TAB_CREATE = 'TAB_CREATE'
export const createTabInGroup = createAction(TAB_CREATE, (groupId, tab) => ({groupId, tab}))
export const createTab = createAction(TAB_CREATE, tab => ({tab}))

export const TAB_REMOVE = 'TAB_REMOVE'
export const removeTab = createAction(TAB_REMOVE, tabId => tabId)

export const TAB_ACTIVATE = 'TAB_ACTIVATE'
export const activateTab = createAction(TAB_ACTIVATE, tabId => tabId)

export const TAB_CREATE_GROUP = 'TAB_CREATE_GROUP'
export const createGroup = createAction(TAB_CREATE_GROUP,
  (groupId, defaultContentType) => ({groupId, defaultContentType})
)

export const TAB_REMOVE_GROUP = 'TAB_REMOVE_GROUP'
export const removeGroup = createAction(TAB_REMOVE_GROUP, groupId => groupId)

export const TAB_UPDATE = 'TAB_UPDATE'
export function updateTab(tabConfig) {
  return {
    type: TAB_UPDATE,
    payload: tabConfig
  }
}

export const TAB_UPDATE_FLAGS = 'TAB_UPDATE_FLAGS'
export const updateTabFlags = (tabId, flag, value=true) => {
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
