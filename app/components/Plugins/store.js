import { observable } from 'mobx'

const store = {
  views: {},
  plugins: observable.map({}),
  list: observable([]),
  toJS () {
    const requiredList = this.list.toJS().filter(obj => obj.enabled && obj.requirement !== 'Required')
    return requiredList
  }
}

// for test
window.pluginStore = store

export default store
