import { observable, computed, action, autorun } from 'mobx'
import { mapEntityFactory } from 'utils/decorators'
import i18n from 'utils/createI18n'
import { mapToJS } from 'utils/toJS'

function TabScope () {
  const state = observable({
    tabs: new observable.map({}),
    tabGroups: new observable.map({}),
    activeTabGroupId: null,
    get activeTabGroup () {
      const activeTabGroup = this.tabGroups.get(this.activeTabGroupId)
      if (!activeTabGroup) return this.tabGroups.values()[0]
      return activeTabGroup
    },
    get activeTab () {
      const activeTabGroup = this.activeTabGroup
      if (!activeTabGroup) return this.tabs.values()[0]
      return activeTabGroup.activeTab
    },
    toJS () {
      return {
        tabs: mapToJS(this.tabs),
        tabGroups: mapToJS(this.tabGroups),
        activeTabGroupId: this.activeTabGroupId
      }
    }
  })

  const mapEntity = mapEntityFactory(state)

  class Tab {

  @observable _title = i18n.get('tab.makeDropdownMenuItems.untitledTab')
  @computed
    get title () { return this._title }
    set title (v) { return this._title = v }

  @observable index = 0
  @observable tabGroupId = ''
  @observable flags = {}

  @computed get tabGroup () {
    return state.tabGroups.get(this.tabGroupId)
  }

  @computed get isActive () {
    return this.tabGroup.activeTab === this
  }

  @computed get siblings () {
    return this.tabGroup.tabs
  }

  @computed get next () {
    return this.siblings[this.index + 1]
  }

  @computed get prev () {
    return this.siblings[this.index - 1]
  }

    getAdjacent (checkNextFirst) {
      const adjacent = checkNextFirst ?
      (this.next || this.prev) : (this.prev || this.next)
      return adjacent
    }

  @action activate () {
    this.tabGroup.activeTabId = this.id
    this.tabGroup.activate()
  }

  @action destroy () {
    this.tabGroup.removeTab(this)
    state.tabs.delete(this.id)
  }
}

  autorun(() => {
    state.tabGroups.forEach((tabGroup) => {
    // correct tab index
      tabGroup.tabs.forEach((tab, tabIndex) => {
        if (tab.index !== tabIndex) tab.index = tabIndex
      })
    })
  })


  class TabGroup {
    static Tab = Tab;

  @observable activeTabId = null

  @computed get tabs () {
    return state.tabs.values()
      .filter(tab => tab.tabGroupId === this.id)
      .sort((a, b) => a.index - b.index)
  }

  @computed get activeTab () {
    const activeTab = state.tabs.get(this.activeTabId)
    if (activeTab && activeTab.tabGroupId === this.id) {
      return activeTab
    }
    return null
  }

  @computed get siblings () {
    return state.tabGroups.values()
  }

  @computed get isActive () {
    return state.activeTabGroup === this
  }

  @mapEntity('tabs')
  @action addTab (tab, insertIndex = this.tabs.length) {
    if (!tab) tab = new this.constructor.Tab()
    tab.index = insertIndex
    tab.tabGroupId = this.id
    tab.activate()
    return tab
  }

  @action activate () {
    state.activeTabGroupId = this.id
  }

  @mapEntity('tabs')
  @action activateTab (tab) {
    tab.activate()
  }

  @mapEntity('tabs')
  @action removeTab (tab) {
    if (tab.isActive) {
      const adjacentTab = tab.getAdjacent()
      if (adjacentTab) adjacentTab.activate()
    }
    tab.tabGroupId = null
  }

  @mapEntity('tabGroups')
  @action merge (tabGroup) {
    if (!tabGroup) return
    const baseIndex = this.tabs.length
    tabGroup.tabs.forEach((tab) => {
      tab.tabGroupId = this.id
      tab.index += baseIndex
    })
    this.activate()
  }

  @mapEntity('tabGroups')
  @action mergeTo (tabGroup) {
    tabGroup.merge(this)
  }

  @action destroy () {
    state.tabGroups.delete(this.id)
  }
}

  return { Tab, TabGroup, state }
}

export default TabScope
