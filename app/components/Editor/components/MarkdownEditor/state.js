import { observable } from 'mobx'

const state = observable({
  leftGrow: 50,
  rightGrow: 50,
  showBigSize: false,
  showPreview: true,
})

export default state
