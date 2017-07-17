import WebSocketClient from './WebSocketClient'
import config from 'config'


export default class ChatManager {
  constructor () {
    this.client = new WebSocketClient()
  }

  send (message) {
    const messageString = JSON.stringify({
      globalKey: config.globalKey,
      message,
    })

    this.client.send(`/app/collaboration/${config.spaceKey}/chat`,
      { id: this.client.id },
      messageString
    )
  }

  subscribe (fn) {
    return this.client.subscribe('chat', fn)
  }

  subscribeStatus (fn) {
    return this.client.subscribe('collaborators', fn)
  }

  onConnected (fn) {
    return this.client.subscribe('connected', fn)
  }

  fetchStatus (fn) {
    this.client.send(`/app/collaboration/${config.spaceKey}/collaborators`,
      {},
      ''
    )
    this.client.emitter.once('status', fn)
  }
}
