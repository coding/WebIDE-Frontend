import { observable, computed } from 'mobx'

const state = observable({
  errorInfo: '',
  errorCode: null,
  status: '',
  errorMsg: '', // 接口返回的错误,
  iconState: 'loading', // 'loading', 'warning', 'error'
  progress: 0,
  userChecked: false,
  checkStep: 0, // 0 用户信息，current 1 腾讯云绑定 2 小主机信息 3 完成
})
export default state
