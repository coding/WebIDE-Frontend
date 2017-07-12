import WebSocketClient from './WebSocketClient'
import config from 'config'


class ChatManager {
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
}
