import { observable, computed } from 'mobx'

const state = observable({
  errorInfo: '',
  errorCode: null,
  status: '',
  errorMsg: '', // 接口返回的错误,
  iconState: 'loading', // 'loading', 'warning', 'error'
})
export default state
