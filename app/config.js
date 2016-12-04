/* @flow weak */
export default {
  projectName: '',
  baseURL: 'http://localhost:8080' || window.location.origin,
  spaceKey: '',
  extensionServer: 'http://localhost:8083' || process.env.EXTENSION_SERVER,
  requiredExtensions: ['feature2', 'feature3']
}
