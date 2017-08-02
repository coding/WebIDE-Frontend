import { observable } from 'mobx'

const store = {
  views: {},
  labels: observable.map({}),
  list: observable([]),
}

export default store
