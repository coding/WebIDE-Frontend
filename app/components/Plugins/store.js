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
  }
}

const pluginDevStore = observable({
  progress: null,
  infomation: null,
  online: false,
})

// for test
window.pluginStore = store
export const pluginConfigEventStore = observable({})

export { pluginDevStore }

export default store
