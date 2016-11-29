export const getTabGroupOfTab = (state, tab) => state.tabGroups.get(tab.tabGroupId)
export const getNextSiblingOfTab = (state, tab) => {
  const tabIds = getTabGroupOfTab(state, tab).tabIds
  if (tabIds.size === 1) return tab
  let nextTabId = tabIds.get(tabIds.indexOf(tab.id) + 1)
  if (nextTabId === undefined) nextTabId = tabIds.get(tabIds.indexOf(tab.id) - 1)
  return state.tabs.get(nextTabId)
}
export const getActiveTabGroup = (state) => state.tabGroups.find(g => g.isActive)
export const getActiveTabOfTabGroup = (state, tabGroup) => {
  return tabGroup.tabIds.map(tabId => state.tabs.get(tabId)).find(t => t.isActive)
}

export const getActiveTab = (state) => {
  let activeTabGroup = getActiveTabGroup(state)
  if (activeTabGroup) return getActiveTabOfTabGroup(state, activeTabGroup)
  return null
}
