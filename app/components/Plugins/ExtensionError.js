
export default class ExtensionError extends Error {
  constructor (message) {
    super(message)
    this.name = ''
    this.reason = ''
  }
}
