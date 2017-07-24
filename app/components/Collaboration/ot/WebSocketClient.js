import BaseWebSocketClient from './BaseWebSocketClient'
import EventEmitter from 'eventemitter3'
import config from 'config'
import uuid from 'uuid/v4'

/* A Stomp Client has the following interface:
 *
 * 1. subscribe(destination: string, callback: func, headers?: object)
 *    => { id: string = headers.id || 'sub-n', unsubscribe: func }
 * `headers` is expect to have { destination, id }
 * internally it'll call `this._transimit('SUBSCRIBE', headers)`
 * and add callback to this.subscriptions[id]
 *
 */

class WebSocketClient extends BaseWebSocketClient {
  constructor () {
    super()
    if (this.constructor.$$singleton) return this.constructor.$$singleton
    // required params:
    this.id = uuid().split('-')[0]
    this.headers = {
      id: this.id,
      globalKey: config.globalKey,
    }
    this.baseURL = `${config.wsURL}/ot/sockjs/`
    this.spaceKey = config.spaceKey

    // bridge stompClient sub/pub to eventemitter's interface
    this.emitter = new EventEmitter()

    this.constructor.$$singleton = this
    this.connect()  // auto connect at instanciation
  }

  successCallback = (stompClient) => {
    // stompClient is instanceof StompClient
    const SELECTION_CHANNEL = `/topic/collaboration/${config.spaceKey}/selections`
    stompClient.subscribe(SELECTION_CHANNEL, (frame) => {
      this.emitter.emit('selections', JSON.parse(frame.body))
    })

    const UPDATED_CHANNEL = `/topic/collaboration/${config.spaceKey}/file/updated`
    stompClient.subscribe(UPDATED_CHANNEL, (frame) => {
      const data = JSON.parse(frame.body)
      if (this.id === data.clientId) {
        this.emitter.emit('ot', { type: 'ack', data })
      } else {
        this.emitter.emit('ot', { type: 'operation', data })
      }
    })

    const COMMITTED_CHANNEL = `/topic/collaboration/${config.spaceKey}/file/committed`
    stompClient.subscribe(COMMITTED_CHANNEL, (frame) => {
      // committed, file change has been persisted to disk,
      // can safely reload/discard local changes
      this.emitter.emit('committed', JSON.parse(frame.body))
    })

    const HISTORY_CHANNEL = `/user/${this.id}/topic/collaboration/${config.spaceKey}/history`
    stompClient.subscribe(HISTORY_CHANNEL, (frame) => {
      this.emitter.emit('history', JSON.parse(frame.body))
    })

    const COLLAB_ONLINE_CHANNEL = `/topic/collaboration/${config.spaceKey}/collaborators`
    stompClient.subscribe(COLLAB_ONLINE_CHANNEL, (frame) => {
      const data = JSON.parse(frame.body)
      this.emitter.emit('collaborators', data)
    })

    const COLLAB_STATUS_CHANNEL = `/user/${this.id}/topic/collaboration/${config.spaceKey}/collaborators`
    stompClient.subscribe(COLLAB_STATUS_CHANNEL, (frame) => {
      const data = JSON.parse(frame.body)
      this.emitter.emit('status', data)
    })

    const CHAT_CHANNEL = `/topic/collaboration/${config.spaceKey}/chat`
    stompClient.subscribe(CHAT_CHANNEL, (frame) => {
      const data = JSON.parse(frame.body)
      this.emitter.emit('chat', data)
    })

    this.emitter.emit('connected')
  }

  errorCallback (frame) { /* noop */ }

  subscribe (event, listener) {
    this.emitter.on(event, listener)
    return function unsubscribe () {
      this.emitter.removeListener(event, listener)
    }
  }

  send (channel, headers, body) {
    switch (arguments.length) {
      case 0:
        return null // noop
      case 1:
        body = ''
        headers = {}
        break
      case 2:
        body = headers
        headers = {}
        break
    }

    if (typeof body !== 'string') body = JSON.stringify(body)
    return this.client.send(channel, { id: this.id, ...headers }, body)
  }
}

export default WebSocketClient
