import { Stomp } from 'stompjs/lib/stomp.js'
import SockJS from 'sockjs-client'
const io = require(__RUN_MODE__ ? 'socket.io-client/dist/socket.io.min.js' : 'socket.io-client-legacy/dist/socket.io.min.js')
import getBackoff from 'utils/getBackoff'
import config from 'config'
import { autorun, runInAction } from 'mobx'

class FsSocketClient {
  constructor () {
    if (FsSocketClient.$$singleton) return FsSocketClient.$$singleton
    const url = config.isPlatform ?
      `${config.wsURL}/sockjs/${config.spaceKey}`
    : `${config.baseURL}/sockjs/`
    const socket = new SockJS(url, {}, {server: `${config.spaceKey}`, transports: 'websocket'})
    this.stompClient = Stomp.over(socket)
    this.stompClient.debug = false // stop logging PING/PONG

    this.backoff = getBackoff({
      delayMin: 50,
      delayMax: 5000,
    })
    this.maxAttempts = 5

    FsSocketClient.$$singleton = this
  }

  connect (connectCallback, errorCallback) {
    const self = this
    self.stompClient.connect({}, function success () {
      runInAction(() => config.fsSocketConnected = true)
      self.connected = true
      self.backoff.reset()
      connectCallback.call(this)
    }, function error () {
      runInAction(() => config.fsSocketConnected = false)
      errorCallback(arguments)
      self.reconnect()
    })
  }

  reconnect (connectCallback, errorCallback) {
    if (this.backoff.attempts <= this.maxAttempts && !this.connected) {
      const retryDelay = this.backoff.duration()
      console.log(`Retry after ${retryDelay}ms`)
      const timer = setTimeout(
        this.connect.bind(this, connectCallback, errorCallback)
      , retryDelay)
    } else {
      this.backoff.reset()
      console.warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }
}



const WORKSPACE_PATH = '/home/coding/workspace'
const BASE_PATH = '~/workspace'

class TtySocketClient {
  constructor () {
    if (TtySocketClient.$$singleton) return TtySocketClient.$$singleton
    if (config.isPlatform) {
      const wsUrl = config.wsURL
      const firstSlashIdx = wsUrl.indexOf('/', 8)
      let [host, path] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]
      this.socket = io.connect(host, {
        forceNew: true,
        reconnection: false,
        autoConnect: false,     // <- will manually handle all connect/reconnect behavior
        reconnectionDelay: 1500,
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
        path: `${path}/tty/${config.shardingGroup}/${config.spaceKey}/connect`,
        transports: ['websocket']
      })
    } else {
      this.socket = io.connect(config.baseURL, { 'resource': 'coding-ide-tty1' })
    }

    this.connected = false
    this.backoff = getBackoff({
      delayMin: 1500,
      delayMax: 10000,
    })
    this.maxAttempts = 5

    TtySocketClient.$$singleton = this
  }

  // manually handle all connect/reconnect behavior
  connectingPromise = undefined
  connect () {
    // Need to make sure EVERY ATTEMPT to connect has ensured `fsSocketConnected == true`
    if (this.socket.connected || this.connectingPromise) return this.connectingPromise
    let resolve, reject
    this.connectingPromise = new Promise((rsv, rjt) => { resolve = rsv; reject = rjt })
    const dispose = autorun(() => { if (config.fsSocketConnected) resolve(true) })
    this.connectingPromise.then(() => {
      dispose()
      this.connectingPromise = undefined

      // below is the actual working part of `connect()` method,
      // all logic above is just for ensuring `fsSocketConnected == true`
      this.socket.io.connect(err => {
        if (err) return this.reconnect()
        // success!
        this.connected = true
        this.backoff.reset()
      })
      this.socket.connect()
    })
  }

  reconnect () {
    if (this.backoff.attempts <= this.maxAttempts && !this.connected) {
      const timer = setTimeout(() => {
        this.connect()
      }, this.backoff.duration())
    } else {
      console.warn(`TTY reconnection fail after ${this.backoff.attempts} attempts`)
      this.backoff.reset()
    }
  }
}

export { FsSocketClient, TtySocketClient }
