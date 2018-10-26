import { observable } from 'mobx'

const state = observable({
  keyword: '',
  list: new observable([]),
  taskId: '',
})

export default state
