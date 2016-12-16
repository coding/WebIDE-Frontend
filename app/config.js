/* @flow weak */
export default {
  projectName: '',
  baseURL: '' || window.location.origin,
  spaceKey: '',
  extensionServer: 'http://localhost:8083' || process.env.EXTENSION_SERVER,
  packageServer: 'http://localhost:8081' || process.env.CODING_PACKAGE_SERVER,
  requiredExtensions: []
}
