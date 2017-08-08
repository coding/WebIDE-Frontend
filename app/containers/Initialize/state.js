import { observable, computed } from 'mobx'

const state = observable({
  errorInfo: '',
  errorCode: null,
  status: '',
})
window.initializeState = state
export default state
