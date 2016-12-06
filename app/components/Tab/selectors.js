import _ from 'lodash'

export const getTabGroupOfTab = (state, tab) => state.tabGroups[tab.tabGroupId]

export const getNextSiblingOfTab = (state, tab) => {
  const tabIds = getTabGroupOfTab(state, tab).tabIds
  if (tabIds.length === 1) return tab
  let nextTabId = tabIds[tabIds.indexOf(tab.id) + 1]
  if (nextTabId === undefined) nextTabId = tabIds[tabIds.indexOf(tab.id) - 1]
  return state.tabs[nextTabId]
}

export const getActiveTabGroup = (state) => _(state.tabGroups).find(g => g.isActive)

export const getActiveTabOfTabGroup = (state, tabGroup) => {
  return _(tabGroup.tabIds).map(tabId => state.tabs[tabId]).find(t => t.isActive)
}

export const getActiveTab = (state) => {
  let activeTabGroup = getActiveTabGroup(state)
  if (activeTabGroup) return getActiveTabOfTabGroup(state, activeTabGroup)
  return null
}
