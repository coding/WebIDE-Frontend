import { observable } from 'mobx'

const state = observable({
  isActive: false,
  pos: { x: 0, y: 0 },
  contextNode: observable.ref(null),
  items: observable.ref([]),
})

export default state
