import { observable, computed } from 'mobx'

const state = observable({
  errorInfo: '',
  errorCode: null,
  status: '',
  errorMsg: ''// 接口返回的错误
})
export default state
