import WebSocketClient from './WebSocketClient'
import EventEmitter from 'eventemitter3'
import config from 'config'
import { adaptServerOperationData, adaptClientOperationData } from './helpers'
import EventBuffer from './EventBuffer'

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
  constructor (filePath, revision) {
    console.log('ServerAdapter init for ', filePath)
    if (!filePath) throw Error('Required param "filePath" is missing at "new ServerAdapter()"')
    this.filePath = filePath
    this.client = new WebSocketClient()
    this.clientId = this.client.id

    // this.emitter = new EventEmitter()
    this.version = revision.version

    this.otEventBuffer = new EventBuffer()
    this.client.emitter.on('ot', this.otSubscription)
    this.client.emitter.on('history', (historyOperations) => {
      this.client.emitter.emit('history_once', historyOperations)
    })
    this.histories = new Map()
    this.otEventBuffer.subscribe((evt) => {
      const hash = evt.data.revision.historyHash.join('.')
      // check is this revision has been applied.
      if (this.histories.has(hash)) return undefined
      this.version = evt.data.revision.version
      this.histories.set(hash, evt)
      const callback = this.callbacks[evt.type]
      if (callback) callback(evt.data)
    })
  }

  fetchMissingOperations (start, end) {
    this.client.send(`/app/collaboration/${config.spaceKey}/history`, {
      path: this.filePath, start, end
    })

    this.client.emitter.once('history_once', missingOperations => {
      // 1. push missing operations into otEventBuffer
      missingOperations.forEach(operationData => {
        const type = this.clientId === operationData.clientId ? 'ack' : 'operation'
        const evt = { type, data: adaptServerOperationData(operationData) }
        this.otEventBuffer.push(evt)
      })
      // 1. sort otEventBuffer by version number in ascending order
      this.otEventBuffer.sort((a, b) => a.data.revision.version - b.data.revision.version)
      this.otEventBuffer.stopBuffer()
    })
  }

  otSubscription = (evt) => {
    // local emitter emits only when filePath matches
    if (evt.data.path !== this.filePath) return
    console.log(evt.data)
    const incomingVersion = evt.data.resultingVersion.version
    const testVersion = window.location.hash.slice(9)
    if (testVersion) {
      if (Number(testVersion) == incomingVersion) return
    }
    // version number must be consecutive integers
    // if incomingVersion is not greater than current version exactly by 1
    // then something is wrong.

    if (this.version + 1 !== incomingVersion) {
      console.error('otEventBuffer start buffer!')
      this.otEventBuffer.startBuffer()
      this.fetchMissingOperations(this.version, incomingVersion - 1)
    }
    evt.data = adaptServerOperationData(evt.data)
    console.log('push into this.otEventBuffer', evt)
    this.otEventBuffer.push(evt)
  }

  registerCallbacks (callbacks) {
    this.callbacks = callbacks
  }

  sendSaveSignal (revision, path) {
    this.client.send(`/app/collaboration/${config.spaceKey}/save`, { version: revision, path })
  }

  sendOperation (revision, operation) {
    const operationMessage = adaptClientOperationData(operation)
    this.client.send(`/app/collaboration/${config.spaceKey}/write`, operationMessage)
    // once send, we wait for [ack] from server
    // if we don't receive ack, we fetchMissingOperations
  }

  sendSelection (selection) {
    // console.log('sending selection')
  }
}

export default ServerAdapter
