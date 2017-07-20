import { observable } from 'mobx'
import getCookie from './utils/getCookie'

const config = observable({
  projectName: '',
  spaceKey: '',
  requiredExtensions: [],
  baseURL: getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin,
  packageDev: getCookie('PACKAGE_DEV') || __PACKAGE_DEV__,
  packageServer: getCookie('PACKAGE_SERVER') || __PACKAGE_SERVER__ || window.location.origin,
  wsURL: getCookie('WS_URL') || __WS_URL__ || __BACKEND_URL__ || window.location.origin,
  runMode: __RUN_MODE__,
  isPlatform: Boolean(__RUN_MODE__),
  fsSocketConnected: false,
  ttySocketConnected: false,
  fileExcludePatterns: ['/.git', '/.coding-ide'],
})

window.config = config
export default config
