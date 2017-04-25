import { extendObservable, createTransformer, action } from 'mobx'
import { handleActions } from 'utils/actions'
import EditorTabState, { Tab, TabGroup } from './state'
import store from 'mobxStore'
import {
  TAB_CREATE,
  TAB_CREATE_IN_GROUP,
  TAB_REMOVE,
  TAB_ACTIVATE,
  TAB_CREATE_GROUP,
  TAB_REMOVE_GROUP,
  TAB_UPDATE,
  TAB_UPDATE_FLAGS,
  TAB_UPDATE_BY_PATH,
  TAB_MOVE_TO_GROUP,
  TAB_MOVE_TO_PANE,
  TAB_INSERT_AT,
  TAB_REMOVE_OTHER,
  TAB_REMOVE_ALL,
} from 'commons/Tab/actions'

const renew = createTransformer(state => {
  return {
    ...state,
    tabGroups: state.tabGroups.toJS(),
    tabs: state.tabs.toJS(),
    activeTab: state.activeTab,
    activeTabGroup: state.activeTabGroup,
  }
})

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
  }
}, EditorTabState)

const TabReducer = action((s, action) => {
  return renew(EditorTabState)
})

export default TabReducer

const crossActionHandlers = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, { tabId, paneId }) => {
    const pane = allState.PaneState.panes.get(paneId)
    const tab = allState.EditorTabState.tabs.get(tabId)
    tab.tabGroup.removeTab(tab)
    pane.tabGroup.addTab(tab)
    return allState
  }
}, store)


export const TabCrossReducer = (state, action) => {
  return state
}
