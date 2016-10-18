/* @flow weak */
export const TAB_DISSOLVE_GROUP = 'TAB_DISSOLVE_GROUP'

export const TAB_CREATE = 'TAB_CREATE'
export function createTabInGroup (groupId, tab) {
  return {
    type: TAB_CREATE,
    groupId,
    tab
  }
}

export function createTab (tab) {
  return {
    type: TAB_CREATE,
    tab: tab
  }
}

export const TAB_REMOVE = 'TAB_REMOVE'
export function removeTab (tabId) {
  return {
    type: TAB_REMOVE,
    tabId: tabId
  }
}

export const TAB_ACTIVATE = 'TAB_ACTIVATE'
export function activateTab (tabId) {
  return {
    type: TAB_ACTIVATE,
    tabId: tabId
  }
}

export const TAB_CREATE_GROUP = 'TAB_CREATE_GROUP'
export function createGroup (groupId, defaultContentType) {
  return {
    type: TAB_CREATE_GROUP,
    groupId,
    defaultContentType
  }
}

export const TAB_REMOVE_GROUP = 'TAB_REMOVE_GROUP'
export function removeGroup (groupId) {
  return {
    type: TAB_REMOVE_GROUP,
    groupId: groupId
  }
}

export const TAB_UPDATE = 'TAB_UPDATE'
export function updateTab(tabConfig) {
  return {
    type: TAB_UPDATE,
    payload: tabConfig
  }
}

export const TAB_UPDATE_FLAGS = 'TAB_UPDATE_FLAGS'
export function updateTabFlags (tabId, flag, value=true) {
  if (!arguments.length) return
  var payload = { tabId }

  if (typeof flag === 'string') {
    payload.flags = {[flag]: arguments[2]}
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
