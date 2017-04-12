import { createTransformer, extendObservable, observable, computed, action, asMap } from 'mobx'
import { update, handleActions } from 'utils'
import { TabStateScope } from 'commons/Tab'
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
  TAB_CONTEXT_MENU_OPEN,
  TAB_CONTEXT_MENU_CLOSE,
  TAB_REMOVE_OTHER,
  TAB_REMOVE_ALL
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

const { Tab: BaseTab, TabGroup, entities } = TabStateScope()
class Tab extends BaseTab {
  constructor (config) {
    super(config)
    extendObservable(this, config)
  }

  @observable path = ''
  @observable content = {}
}

const _state = entities

const TabActionHandler = handleActions({
  [TAB_CREATE]: (state, payload) => {
    const tabConfig = payload
    const tab = new Tab(tabConfig)
    const activeTabGroup = entities.activeTabGroup
    activeTabGroup.addTab(tab)
  },

  [TAB_CREATE_IN_GROUP]: (state, payload) => {
    const { groupId, tab: tabConfig } = payload
    const tab = new Tab(tabConfig)
    state.tabGroups[groupId].addTab(tab)
  },

  [TAB_REMOVE]: (state, payload) => {
    const tab = state.tabs[payload]
    if (tab.isActive) {
      const adjacentTab = tab.next || tab.prev
      if (adjacentTab) adjacentTab.activate()
    }
    tab.destroy()
  },

  [TAB_REMOVE_OTHER]: (state, payload) => {
    const tab = state.tabs[payload]
    tab.activate()
    // action(() => {
      tab.tabGroup.tabs.forEach(eachTab => {
        if (eachTab !== tab) eachTab.destroy()
      })
    // })
  },

  [TAB_REMOVE_ALL]: (state, payload) => {
    const tab = state.tabs[payload]
    // action(() => {
      tab.tabGroup.tabs.forEach(tab => tab.destroy())
    // })
  },

  [TAB_CREATE_GROUP]: (state, payload) => {
    const { groupId } = payload
    const tabGroup = new TabGroup({ id: groupId })
  },

  [TAB_REMOVE_GROUP]: (state, payload) => {
    const tab = state.tabs[payload]
  },

  [TAB_UPDATE]: (state, payload) => {
    const tabId = payload.id
    const tab = state.tabs[tabId]
    if (tab) extendObservable(tab, payload)
  },

  [TAB_UPDATE_FLAGS]: (state, { tabId, flags }) => {
    const tab = state.tabs[tabId]
    tab.flags = flags
  },

  [TAB_MOVE_TO_GROUP]: (state, { tabId, groupId }) => {
    const tab = state.tabs[tabId]
    const tabGroup = state.tabGroups[groupId]
    if (!tab || !tabGroup) return
    tabGroup.addTab(tab)
  },

  [TAB_INSERT_AT]: (state, { tabId, beforeTabId }) => {
    const tab = state.tabs[tabId]
    const anchorTab = state.tabs[beforeTabId]
    let insertIndex = 0
    let prev = anchorTab.prev
    if (!prev) {
      insertIndex = -1
    } else {
      insertIndex = (anchorTab.index + prev.index) / 2
    }
    tab.tabGroup.addTab(tab, insertIndex)
  },

})

const TabReducer = (state, action) => {
  const nextState = TabActionHandler(state, action)
  if (nextState) return nextState
  return renew(_state)
}

export default TabReducer

export const TabCrossReducer = handleActions({
  [TAB_MOVE_TO_PANE]: (allState, { tabId, paneId }) => {
    return allState
  }
})
