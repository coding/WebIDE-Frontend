/* @flow weak */
import _ from 'lodash'
import {
  TAB_CREATE,
  TAB_REMOVE,
  TAB_ACTIVATE,
  TAB_CREATE_GROUP,
  TAB_REMOVE_GROUP,
  TAB_DISSOLVE_GROUP
} from './actions'

class Tab {
  constructor (tab = {}, tabGroup) {
    const {id, isActive, status, icon, title, path, content} = tab
    this.id = id || _.uniqueId('tab_')
    this.status = status || 'modified'
    this.icon = icon || 'fa fa-folder-o'
    this.title = title || 'untitled'
    this.isActive = isActive || true
    this.path = path
    this.content = '' || content
    this.group = tabGroup
  }
}

class TabGroup {
  constructor (id, type) {
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
    tab.group.state.activateGroup(tab.group)
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

}

class TabState {
  constructor (prevState) {
    Object.assign(this, prevState)
    // always reconnect tab -> group link
    this.tabGroups.forEach(tabGroup => {
      tabGroup.state = this
      tabGroup.tabs.forEach(tab => tab.group = tabGroup)
    })
  }

  getGroupById (id) {
    return _.find(this.tabGroups, {id: id})
  }

  getTabById (id) {
    var allTabs = this.tabGroups.reduce((accumulator, tabGroup) => {
      return accumulator.concat(tabGroup.tabs)
    }, [])
    return _.find(allTabs, {id: id})
  }

  addGroup (group) {
    this.tabGroups.push(group)
    this.activateGroup(group)
  }

  get activeGroup () {
    var len = this.tabGroups.length
    return (len > 0) ? this.tabGroups[len - 1] : null
  }

  activateGroup (group) {
    if (typeof group === 'string') group = this.getGroupById(id)
    this.deactivateAllGroups()
    group.isActive = true
    // lift the active group to top of stack.
    this.tabGroups.sort(_group => {
      if (_group === group) return 1
      return -1
    })
    return group
  }

  deactivateAllGroups () {
    this.tabGroups.forEach(tabGroup => tabGroup.isActive = false)
  }

  activatePrevGroup (last = -1) {
    if (last >= 0) return null
    var len = this.tabGroups.length
    if (len > 1) {
      var prevActiveGroup = this.tabGroups[len - 1 + last]
      this.activateGroup(prevActiveGroup)
      return prevActiveGroup
    } else {
      return null
    }
  }
}

let _state = new TabState({tabGroups: []})

export default function TabReducer (state = _state, action) {
  switch (action.type) {

    case TAB_CREATE:
      var tabGroup = state.getGroupById(action.groupId)
      if (!tabGroup) tabGroup = state.activeGroup
      var newTab = new Tab(action.tab, tabGroup)
      tabGroup.tabs.push(newTab)
      tabGroup.activateTab(newTab)
      return new TabState(state)

    case TAB_REMOVE:
      var tab = state.getTabById(action.tabId)
      if (tab.isActive) {
        tab.group.activateNextTab()
      }
      tab.group.removeTab(tab)
      return new TabState(state)

    case TAB_ACTIVATE:
      var tab = state.getTabById(action.tabId)
      if (tab.isActive) return state
      tab.group.activateTab(action.tabId)
      return new TabState(state)

    case TAB_DISSOLVE_GROUP:
      return state

    case TAB_CREATE_GROUP:
      state.deactivateAllGroups()
      state.addGroup(new TabGroup(action.groupId, action.defaultContentType))
      return new TabState(state)

    case TAB_REMOVE_GROUP:
      _.remove(state.tabGroups, {id: action.groupId})
      return new TabState(state)

    default:
      return state
  }
}
