import { observable } from 'mobx'

const store = {
  views: {},
  plugins: observable.map({}),
  list: observable([]),
  thirdPartyList: observable([]),
  editorViews: observable.map({}),
  toJS () {
    const requiredList = this.list.toJS().filter(obj => obj.enabled && obj.requirement !== 'Required')
    return requiredList
  },
  pluginDevState: observable({
    progress: null,
    infomation: null,
    online: false,
  }),
  pluginSettingsItem: observable.map()
}

// for test
window.pluginStore = store
export const pluginConfigEventStore = observable({})

export const pluginDevStore = store.pluginDevState
export const pluginSettingsItem = store.pluginSettingsItem

export default store
