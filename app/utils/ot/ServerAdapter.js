import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'
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
 * 2.
 */

class ServerAdapter {
  constructor () {
    if (this.constructor.$$singleton) return this.constructor.$$singleton
    // SockJS auto connects at initiation
    this.backoff = getBackoff({ delayMin: 50, delayMax: 5000 })
    this.maxAttempts = 7
    this.constructor.$$singleton = this
    this.id = uuid().split('-')[0]

    this.connect(this.connectSuccess.bind(this))
  }

  connectSuccess (client) {
    const updatedChannel = `/topic/collaboration/${config.spaceKey}/file/updated`
    client.subscribe(updatedChannel, (frame) => {
      const data = JSON.parse(frame.body)
      if (this.id === data.clientId) {
        this.trigger('ack', data)
      } else {
        this.trigger('operation', data)
      }
    })

    const committedChannel = `/topic/collaboration/${config.spaceKey}/file/committed`
    client.subscribe(committedChannel, (frame) => {
      console.log('ot committed', frame)
    })
  }

  connect (connectCallback, errorCallback) {
    if (!this.ws || !this.client) {
      this.ws = new SockJS(`${config.wsURL}/ot/sockjs/${config.spaceKey}`, {},
        { server: `${config.spaceKey}`, transports: 'websocket' }
      )
      this.client = Stomp.over(this.ws)
      this.client.debug = false // stop console.logging PING/PONG
    }

    const success = () => {
      this.backoff.reset()
      connectCallback(this.client)
    }
    const error = (...args) => {
      switch (this.ws.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          this.reconnect(connectCallback, errorCallback)
          break
        case SockJS.OPEN:
          console.log('FRAME ERROR', args[0])
          break
        default:
      }
      errorCallback(args)
    }

    this.client.connect({ id: this.id }, success, error)
  }

  reconnect (connectCallback, errorCallback) {
    // unset this.ws
    this.ws = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
      const retryDelay = this.backoff.duration()
      setTimeout(
        this.connect.bind(this, connectCallback, errorCallback)
      , retryDelay)
    } else { // exceed maxAttempts
      this.backoff.reset()
      // todo: insert here notify or other Call-To-Action
      console.warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }

  // ot specifics
  registerCallbacks (callbacks) {
    this.callbacks = callbacks
  }

  trigger (event, ...args) {
    const callback = this.callbacks && this.callbacks[event]
    if (callback) { callback.apply(this, args) }
  }

  sendSaveSignal (revision, path) {
    const message = JSON.stringify({ version: revision, path })
    this.client.send(`/app/collaboration/${config.spaceKey}/save`, { id: this.id }, message)
  }

  sendOperation (revision, operation, selection) {
    console.log('sendOperation revision', revision)
    this.client.send(`/app/collaboration/${config.spaceKey}/write`, { id: this.id }, operation)
  }

  sendSelection (selection) {
    console.log('sending selection')
  }
}

function encodeOperationForServer (clientId, filePath, targetVersion, textOperation) {
  const ops = textOperation.ops.map(op => {
    if (isRetain(op)) {
      return {
        type: 'RETAIN',
        content: String(op),
      }
    } else if (isInsert(op)) {
      return {
        type: 'CHARACTERS',
        content: op,
      }
    } else if (isDelete(op)) {
      let nonsenseString = ''
      while (op < 0) {
        nonsenseString += '_'
        op++
      }
      return {
        type: 'DELETE_CHARACTERS',
        content: nonsenseString,
      }
    }
  })

  return {
    path: filePath,
    author: config.globalKey || 'foobar',
    clientId,
    targetVersion,
    ops,
  }
}

function decodeOperationFromServer (operationMessage) {
  const {
    spaceKey,
    path,
    author,
    resultingVersion,
    clientId,
  } = operationMessage

  const ops = operationMessage.ops.map(op => {
    switch (op.type) {
      case 'RETAIN':
        return Number(op.content)
      case 'CHARACTERS':
        return op.content
      case 'DELETE_CHARACTERS':
        return op.content.length * -1
    }
  })
  return { clientId, ops, path }
}


export default ServerAdapter
