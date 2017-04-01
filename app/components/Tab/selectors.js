export const getTabGroupOfTab = (state, tab) => state.tabGroups[tab.tabGroupId]

export const getNextSiblingOfTab = (state, tab) => {
  const tabIds = getTabGroupOfTab(state, tab).tabIds
  if (tabIds.length === 1) return tab
  let nextTabId = tabIds[tabIds.indexOf(tab.id) + 1]
  if (nextTabId === undefined) nextTabId = tabIds[tabIds.indexOf(tab.id) - 1]
  return state.tabs[nextTabId]
}

export const getActiveTabGroup = (state) => state.tabGroups[state.activeTabGroupId]

export const getActiveTabOfTabGroup = (state, tabGroup) => state.tabs[tabGroup.activeTabId]

export const getActiveTab = (state) => {
  let activeTabGroup = getActiveTabGroup(state)
  if (activeTabGroup) return getActiveTabOfTabGroup(state, activeTabGroup)
  return null
}

export const isActive = (state, tabOrTabGroup) => {
  let tab, tabGroup
  if (typeof tabOrTabGroup.tabGroupId === 'string') { // is a tab
    tab = tabOrTabGroup
    tabGroup = state.tabGroups[tab.tabGroupId]
    return tabGroup.activeTabId === tab.id
  } else { // is a tabGroup
    tabGroup = tabOrTabGroup
    return state.activeTabGroupId === tabGroup.id
  }
}

export const getTabsByPath = (state, path) => {
  return Object.values(state.tabs).filter(tab => tab.path === path)
}
