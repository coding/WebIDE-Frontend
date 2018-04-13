import { observable } from 'mobx'

const state = observable({
  operating: false,
  operatingMessage: '',
  countdown: 0,
  progress: 0,
})

export default state
