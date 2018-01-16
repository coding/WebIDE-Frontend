import { observable, autorun } from 'mobx'
import getCookie from './utils/getCookie'

const config = observable({
  projectName: '',
  spaceKey: '',
  requiredExtensions: [],
  baseURL: getCookie('BACKEND_URL') || __BACKEND_URL__ || window.location.origin,
  packageDev: getCookie('PACKAGE_DEV') || __PACKAGE_DEV__,
  packageServer: getCookie('PACKAGE_SERVER') || __PACKAGE_SERVER__ || window.location.origin,
  wsURL: getCookie('WS_URL') || __WS_URL__ || __BACKEND_URL__ || window.location.origin,
  staticServingURL: getCookie('STATIC_SERVING_URL') || __STATIC_SERVING_URL__ || window.location.origin,
  runMode: __RUN_MODE__,
  // isPlatform: Boolean(__RUN_MODE__),
  fsSocketConnected: false,
  ttySocketConnected: false,
  fileExcludePatterns: ['/.git', '/.coding-ide'],
  preventAccidentalClose: false,
  hasRehydrated: getCookie('skipRehydrate') || false,
  estimatedMap: observable.map({}),
  nodeEnv: __NODE_ENV__ || null,
  get previewURL () {
    if (config.staticServingToken && config.spaceKey && config.staticServingURL) {
      return config.staticServingURL.replace(
        '{space-key}', config.spaceKey
      ).replace(
        '{access-token}', config.staticServingToken
      )
    }
    return ''
  },
  get isLib () {
    return config.runMode === 'lib'
  },
  get isPlatform () {
    return Boolean(__RUN_MODE__) || config.runMode === 'lib'
  }
})

autorun(() => {
  if (config.projectName && !config.isLib) {
    window.document.title = `${config.projectName} | Coding WebIDE 开启云端开发模式！ -  Coding.net`
  }
})

window.config = config
export default config
