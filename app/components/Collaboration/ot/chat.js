import WebSocketClient from './WebSocketClient'
import config from 'config'
import { autorun } from 'mobx'
import { FsSocketClient } from 'backendAPI/websocketClients'

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

  // fixme: chat.js is obviously doing much more than what its name indicates
  // another module should be added to handle all these complication
  // `CollaborationManager.js` maybe
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

  subscribeSelect (fn) {
    this.client.subscribe('selections', fn)
  }

  sendAction ({ action, globalKey }) {
    const messageString = JSON.stringify({
      globalKey,
      action,
      id: this.client.id,
    })
    this.client.send(`/app/collaboration/${config.spaceKey}/collaborator/actions`,
      {},
      messageString
    )
  }

  subscribeToFsSocket (fn) {
    autorun(() => {
      if (!config.fsSocketConnected) return
      const client = FsSocketClient.$$singleton.stompClient

      client.subscribe(`/topic/collaboration/${config.spaceKey}/collaborators`, fn)
    })
  }
}
