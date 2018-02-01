import { observable } from 'mobx'

const state = observable({
  operating: false,
  operatingMessage: '',
})

export default state
