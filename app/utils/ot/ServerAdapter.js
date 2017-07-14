import WebSocketClient from './WebSocketClient'
import EventEmitter from 'eventemitter3'
import config from 'config'
import { adaptServerOperationData, adaptClientOperationData } from './helpers'
import EventBuffer from './EventBuffer'
import debounce from 'lodash/debounce'

/*
interface ServerAdapterInterface {
  filePath: string;
  client: WebSocketClient;
  clientId: string;
  version: number;
  otEventBuffer: EventBuffer;
  histories: Map;
  callbacks: object;
  ackTimeout: number;

  otSubscription: (evt: EventEmitterEventObject): void
  fetchMissingOperations: (start: number, end: number): void
  sendSaveSignal: (revision: object, path: string): void
  sendOperation: (revision: object, operation: object): void
  sendSelection: (selection: Selection): void
}
*/

class ServerAdapter {
  constructor (filePath, revision) {
    if (!filePath) throw Error('Required param "filePath" is missing at "new ServerAdapter()"')
    this.filePath = filePath
    this.client = new WebSocketClient()
    this.clientId = this.client.id

    this.version = revision.version
    this.callbacks = {}
    this.ackTimeout = 0

    this.otEventBuffer = new EventBuffer()
    this.client.emitter.on('ot', this.receiveOperation)
    this.client.emitter.on('selections', this.receiveSelection)

    this.histories = new Map()
    this.otEventBuffer.subscribe((evt) => {
      const hash = evt.data.revision.historyHash.join('.')
      // check is this revision has been applied.
      if (this.histories.has(hash)) return undefined
      this.version = evt.data.revision.version
      this.histories.set(hash, evt)

      switch (evt.type) {
        case 'operation':
          this.callbacks.operation(evt.data)
          break
        case 'ack':
          this.callbacks.ack(evt.data)
          clearTimeout(this.ackTimeout)
          break
        default:
          break
      }
    })
  }

  registerCallbacks (callbacks) {
    this.callbacks = callbacks
  }

  fetchMissingOperations (start, end) {
    this.client.send(`/app/collaboration/${config.spaceKey}/history`, {
      path: this.filePath, start, end
    })

    this.client.emitter.once('history', missingOperations => {
      // 1. push missing operations into otEventBuffer
      missingOperations.forEach(operationData => {
        const type = this.clientId === operationData.clientId ? 'ack' : 'operation'
        const evt = { type, data: adaptServerOperationData(operationData) }
        this.otEventBuffer.push(evt)
      })
      // 2. sort otEventBuffer by version number in ascending order
      this.otEventBuffer.sort((a, b) => a.data.revision.version - b.data.revision.version)
      this.otEventBuffer.stopBuffer()
    })
  }

  receiveOperation = (evt) => {
    // local emitter emits only when filePath matches
    if (evt.data.path !== this.filePath) return
    const incomingVersion = evt.data.resultingVersion.version
    const testVersion = window.location.hash.slice(9)
    if (testVersion) {
      if (Number(testVersion) === incomingVersion) return
    }
    // version number must be consecutive integers
    // if incomingVersion is not greater than current version exactly by 1
    // then something is wrong.

    if (this.version + 1 !== incomingVersion) {
      this.otEventBuffer.startBuffer()
      this.fetchMissingOperations(this.version, incomingVersion - 1)
    }
    evt.data = adaptServerOperationData(evt.data)
    this.otEventBuffer.push(evt)
  }

  receiveSelection = (data) => {
    if (data.path !== this.filePath) return
    if (data.clientId === this.clientId) return
    this.callbacks.selections(data)
  }

  sendOperation (revision, operation) {
    const operationMessage = adaptClientOperationData(operation)
    this.client.send(`/app/collaboration/${config.spaceKey}/write`, operationMessage)
    // once send, we wait for [ack] from server
    // if we don't receive ack, we fetchMissingOperations
    this.ackTimeout = setTimeout(() => {
      const version = operation.targetVersion.version
      this.fetchMissingOperations(version, version + 1)
    }, 1000)
  }

  sendSelection = debounce((selection) => {
    if (!selection) selection = { ranges: null }
    this.client.send(`/app/collaboration/${config.spaceKey}/selections`,
      { path: this.filePath, selections: selection.ranges }
    )
  }, 10)

  sendSaveSignal (revision, path) {
    this.client.send(`/app/collaboration/${config.spaceKey}/save`, { version: revision, path })
  }
}

export default ServerAdapter
