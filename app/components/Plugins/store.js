import { observable } from 'mobx'

const store = {
  views: {},
  plugins: observable.map({}),
  list: observable([]),
}

// for test
window.pluginStore = store

export default store
