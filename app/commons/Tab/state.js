import _ from 'lodash'
import { extendObservable, observable, computed, action, asMap } from 'mobx'
import { mapEntityFactory } from 'utils/decorators'

function TabScope () {

const entities = {
  tabs: observable.map({}),
  tabGroups: observable.map({}),
  activeTabGroupId: null,
  get activeTabGroup () {
    let activeTabGroup = this.tabGroups.get(activeTabGroupId)
    if (!activeTabGroup)
    return activeTabGroup
  },
}

const mapEntity = mapEntityFactory(entities)

class Tab {
  constructor (config) {
    this.id = _.uniqueId('tab_')
    entities.tabs.set(this.id, this)
  }

  @observable title = 'untitled'
  @observable index = 0
  @observable tabGroupId = ''

  @computed get tabGroup () {
    return entities.tabGroups.get(this.tabGroupId)
  }

  @computed get isActive () {
    return this.tabGroup.activeTab === this
  }

  @action activate () {
    this.tabGroup.activeTabId = this.id
  }

  @action destroy () {
    entities.tabs.delete(this.id)
  }
}

class TabGroup {
  constructor (config) {
    this.id = _.uniqueId('tab_group_')
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
  @action addTab (tab, dontActivate) {
    if (!tab || !(tab instanceof Tab)) tab = new Tab()
    if (tab.tabGroupId === this.id) return
    tab.index = this.tabs.length
    tab.tabGroupId = this.id
    if (!dontActivate) this.activeTabId = tab.id
    return tab
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
