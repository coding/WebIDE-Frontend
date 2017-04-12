import _ from 'lodash'
import { observable, computed, action, autorun } from 'mobx'
import { mapEntityFactory } from 'utils/decorators'

function TabScope () {

const entities = observable({
  tabs: observable.map({}),
  tabGroups: observable.map({}),
  activeTabGroupId: null,
  get activeTabGroup () {
    let activeTabGroup = this.tabGroups.get(this.activeTabGroupId)
    if (!activeTabGroup) return this.tabGroups.values()[0]
    return activeTabGroup
  },
  get activeTab () {
    const activeTabGroup = this.activeTabGroup
    if (!activeTabGroup) return this.tabs.values()[0]
    return activeTabGroup.activeTab
  }
})

const mapEntity = mapEntityFactory(entities)

class Tab {
  constructor (config={}) {
    this.id = config.id || _.uniqueId('tab_')
    entities.tabs.set(this.id, this)
  }

  @observable title = 'untitled'
  @observable index = 0
  @observable tabGroupId = ''
  @observable flags = {}

  @computed get tabGroup () {
    return entities.tabGroups.get(this.tabGroupId)
  }

  @computed get isActive () {
    return this.tabGroup.activeTab === this
  }

  @computed get next () {
    const siblingTabs = this.tabGroup.tabs
    return siblingTabs[this.index + 1]
  }

  @computed get prev () {
    const siblingTabs = this.tabGroup.tabs
    return siblingTabs[this.index - 1]
  }

  @action activate () {
    this.tabGroup.activeTabId = this.id
    entities.activeTabGroupId = this.tabGroup.id
  }

  @action destroy () {
    entities.tabs.delete(this.id)
  }
}

autorun(() => {
  entities.tabGroups.forEach(tabGroup => {
    tabGroup.tabs.forEach((tab, tabIndex) => {
      if (tab.index !== tabIndex) tab.index = tabIndex
    })
  })
})

class TabGroup {
  constructor (config={}) {
    this.id = config.id || _.uniqueId('tab_group_')
    entities.tabGroups.set(this.id, this)
  }

  @observable activeTabId = null

  @computed get tabs () {
    return entities.tabs.values()
      .filter(tab => tab.tabGroupId === this.id)
      .sort((a, b) => a.index - b.index)
  }

  @computed get activeTab () {
    let activeTab = entities.tabs.get(this.activeTabId)
    if (!activeTab) activeTab = this.tabs[0]
    return activeTab
  }

  @computed get siblings () {
    return _.without(entities.tabGroups.values(), this)
  }

  @mapEntity('tabs')
  @action addTab (tab, insertIndex = this.tabs.length) {
    if (!tab) tab = new Tab()
    tab.index = insertIndex
    tab.tabGroupId = this.id
    this.activeTabId = tab.id
    return tab
  }

  @action activate () {
    entities.activeTabGroupId = this.id
  }

  @mapEntity('tabs')
  @action activateTab (tab) {
    this.activeTabId = tab.id
  }

  @mapEntity('tabs')
  @action removeTab (tab) {
    tab.tabGroupId = null
  }

  @action destroy () {
    entities.tabGroups.delete(this.id)
  }
}

return { Tab, TabGroup, entities }

}

export default TabScope
