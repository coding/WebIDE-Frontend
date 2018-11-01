import { observable } from 'mobx'

const state = observable({
  keyword: '',
  result: {},
  taskId: '',
  searching: false,
})

export default state
