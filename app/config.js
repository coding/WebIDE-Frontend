/* @flow weak */
export default {
  projectName: '',
  spaceKey: '',
  requiredExtensions: [],
  baseURL: __BACKEND_URL__ || window.location.origin,
  packageServer: __PACKAGE_SERVER__ || window.location.origin,
  wsURL: __WS_URL__,
  runMode: __RUN_MODE__,
  isPlatform: Boolean(__RUN_MODE__),
}
