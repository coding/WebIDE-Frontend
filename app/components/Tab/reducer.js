/* @flow weak */
import _ from 'lodash'
import { handleActions } from 'redux-actions'
import {
  TAB_CREATE,
  TAB_REMOVE,
  TAB_ACTIVATE,
  TAB_CREATE_GROUP,
  TAB_REMOVE_GROUP,
  TAB_DISSOLVE_GROUP,
  TAB_UPDATE,
  TAB_UPDATE_FLAGS,
  TAB_MOVE_TO_GROUP
} from './actions'

class Tab {
  constructor (tab = {}, tabGroup) {
    const {id, isActive, flags, icon, title, path, content} = tab
    this.id = id || _.uniqueId('tab_')
    this.flags = flags || {}
    this.icon = icon || 'fa fa-folder-o'
    this.title = title || 'untitled'
    this.isActive = isActive || true
    this.path = path
    this.content = '' || content
    this.group = tabGroup
  }

  update (tab) {
    _.extend(this, tab)
  }

  updateFlags (flags) {
    _.extend(this.flags, flags)
  }
}

class TabGroup {
  constructor (id, type) {
    let tabGroup = getGroupById(id)
    if (tabGroup) return tabGroup
    this.id = id || _.uniqueId('tab_group_')
    this.tabs = []
    this.type = type
    this.isActive = true
    this.activeTab = null
  }

  getTabById (id) {
    return _.find(this.tabs, {id: id})
  }

  removeTab (tab) {
    if (typeof tab === 'string') tab = this.getTabById(tab)
    if (tab) _.remove(this.tabs, tab)
    if (this.activeTab === tab) this.activeTab = null
  }

  activateTab (tab) {
    if (!tab) return
    if (typeof tab === 'string') tab = this.getTabById(tab)
    this.deactivateAllTabsInGroup()
    tab.isActive = true
    this.activeTab = tab
    if (tab.editor) tab.editor.focus()
    activateGroup(tab.group)
  }

  activateNextTab () {
    if (!this.activeTab) return
    var i = this.tabs.indexOf(this.activeTab)
    if (i == this.tabs.length - 1) var isLast = true
    if (isLast) {
      this.activateTab(this.tabs[i - 1])
    } else {
      this.activateTab(this.tabs[i + 1])
    }
  }

  deactivateAllTabsInGroup () {
    this.tabs.forEach(tab => tab.isActive = false)
  }

  mergeTabs (tabsToBeMerged) {
    for (let i = 0; i < tabsToBeMerged.length; i++) {
      this.tabs.push(tabsToBeMerged[i])
    }
    if (this.activeTab) {
      this.activateTab(this.activeTab)
    } else {
      this.activateTab(this.tabs[0])
    }
  }

}

const tabGroups = []
const indexes = {}
const normalizeState = (prevState) => {
  tabGroups.forEach(tabGroup => {
    tabGroup.tabs.forEach(tab => tab.group = tabGroup)
  })
  return {_timestamp: Date.now(), tabGroups, getGroupById, getActiveGroup, activateGroup, activatePrevGroup, normalizeState}
}

function getGroupById (id) {
  return _.find(tabGroups, {id: id})
}

function getTabById (id) {
  var allTabs = tabGroups.reduce((accumulator, tabGroup) => {
    return accumulator.concat(tabGroup.tabs)
  }, [])
  return _.find(allTabs, {id: id})
}

function getActiveGroup () {
  var len = tabGroups.length
  var ret = (len > 0) ? tabGroups[len - 1] : {}
  return ret
}

function addGroup (group) {
  tabGroups.push(group)
  activateGroup(group)
}

function activateGroup (group) {
  if (typeof group === 'string') group = getGroupById(id)
  deactivateAllGroups()
  group.isActive = true
  // lift the active group to top of stack, or say end of the list
  tabGroups.sort(_group => {
    if (_group === group) return 1
    return -1
  })
  return group
}

function deactivateAllGroups () {
  tabGroups.forEach(tabGroup => tabGroup.isActive = false)
}

function activatePrevGroup (last = -1) {
  if (last >= 0) return null
  var len = tabGroups.length
  if (len > 1) {
    var prevActiveGroup = tabGroups[len - 1 + last]
    activateGroup(prevActiveGroup)
    return prevActiveGroup
  } else {
    return null
  }
}

let _state = normalizeState({tabGroups: []})
export default handleActions({
  [TAB_CREATE]: (state, action) => {
    const {groupId, tab} = action.payload
    var tabGroup = getGroupById(groupId)
    if (!tabGroup) tabGroup = getActiveGroup()
    var newTab = new Tab(tab, tabGroup)
    tabGroup.tabs.push(newTab)
    tabGroup.activateTab(newTab)
    return normalizeState(state)
  },

  [TAB_REMOVE]: (state, action) => {
    var tab = getTabById(action.payload)
    if (tab.isActive) {
      tab.group.activateNextTab()
    }
    tab.group.removeTab(tab)
    return normalizeState(state)
  },

  [TAB_ACTIVATE]: (state, action) => {
    const tab = getTabById(action.payload)
    if (tab.isActive) return state
    tab.group.activateTab(action.payload)
    return normalizeState(state)
  },

  [TAB_CREATE_GROUP]: (state, action) => {
    const {groupId, defaultContentType} = action.payload
    deactivateAllGroups()
    addGroup(new TabGroup(groupId, defaultContentType))
    return normalizeState(state)
  },

  [TAB_REMOVE_GROUP]: (state, action) => {
    _.remove(tabGroups, {id: action.payload})
    return normalizeState(state)
  },

  [TAB_UPDATE]: (state, action) => {
    const tabConfig = action.payload
    const tab = getTabById(tabConfig.id)
    tab.update(tabConfig)
    return normalizeState(state)
  },

  [TAB_UPDATE_FLAGS]: (state, action) => {
    const {tabId, flags} = action.payload
    var tab = getTabById(tabId)
    tab.updateFlags(flags)
    return normalizeState(state)
  },

  [TAB_MOVE_TO_GROUP]: (state, action) => {
    const {tabId, groupId} = action.payload
    let tab = getTabById(tabId)
    if (tab.group.id === groupId) return state

    let tabGroup = getGroupById(groupId)
    if (tab.isActive) {
      tab.group.activateNextTab()
    }
    tab.group.removeTab(tab)
    tabGroup.tabs.push(tab)
    tabGroup.activateTab(tab)
    return normalizeState(state)
  }
}, _state)

/**
 * The state shape:
 *
 *  TabState: {
      tabGroups: {
        [tab_group_id <String>]: {
          id:         <String>
          type:       <String>
          isActive:   <Boolean>
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
      }
    }
 */
