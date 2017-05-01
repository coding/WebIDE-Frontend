import getCookie from './utils/getCookie'
import { observable } from 'mobx'

const config = observable({
  projectName: '',
  spaceKey: '',
  requiredExtensions: [],
  baseURL: getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin,
  packageServer: getCookie('PACKAGE_SERVER') || __PACKAGE_SERVER__ || window.location.origin,
  wsURL: getCookie('WS_URL') || __WS_URL__ || __BACKEND_URL__ || window.location.origin,
  runMode: __RUN_MODE__,
  isPlatform: Boolean(__RUN_MODE__),
  fsSocketConnected: false,
  ttySocketConnected: false,
})

window.config = config
export default config
