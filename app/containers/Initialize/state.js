import { observable, computed } from 'mobx'

const state = observable({
  errorInfo: '',
  errorCode: null,
  status: '',
})

export default state
