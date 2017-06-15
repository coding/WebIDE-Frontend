import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'
import config from 'config'
import { autorun, runInAction } from 'mobx'

const log = console.log || (x => x)
const warn = console.warn || (x => x)

const io = require(__RUN_MODE__ ? 'socket.io-client/dist/socket.io.min.js' : 'socket.io-client-legacy/dist/socket.io.min.js')

class FsSocketClient {
  constructor () {
    if (FsSocketClient.$$singleton) return FsSocketClient.$$singleton
    const url = config.isPlatform ?
      `${config.wsURL}/sockjs/${config.spaceKey}`
    : `${config.baseURL}/sockjs/`
    // SockJS auto connects at initiation
    this.sockJSConfigs = [url, {}, { server: `${config.spaceKey}`, transports: 'websocket' }]
    this.backoff = getBackoff({
      delayMin: 50,
      delayMax: 5000,
    })
    this.maxAttempts = 7
    FsSocketClient.$$singleton = this
  }

  connect (connectCallback, errorCallback) {
    const self = this
    if (!this.socket || !this.stompClient) {
      this.socket = new SockJS(...this.sockJSConfigs)
      this.stompClient = Stomp.over(this.socket)
      this.stompClient.debug = false // stop logging PING/PONG
    }
    self.stompClient.connect({}, function success () {
      runInAction(() => config.fsSocketConnected = true)
      self.backoff.reset()
      connectCallback.call(this)
    }, function error () {
      log('fsSocket error')
      switch (self.socket.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          runInAction(() => config.fsSocketConnected = false)
          self.reconnect(connectCallback, errorCallback)
          break
        case SockJS.OPEN:
          log('FRAME ERROR', arguments[0])
          break
        default:
      }
      errorCallback(arguments)
    })
  }

  reconnect (connectCallback, errorCallback) {
    if (config.fsSocketConnected) return
    log(`try reconnect fsSocket ${this.backoff.attempts}`)
    // unset this.socket
    this.socket = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
      const retryDelay = this.backoff.duration()
      log(`Retry after ${retryDelay}ms`)
      const timer = setTimeout(
        this.connect.bind(this, connectCallback, errorCallback)
      , retryDelay)
    } else {
      this.backoff.reset()
      warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }
}


class TtySocketClient {
  constructor () {
    if (TtySocketClient.$$singleton) return TtySocketClient.$$singleton
    if (config.isPlatform) {
      const wsUrl = config.wsURL
      const firstSlashIdx = wsUrl.indexOf('/', 8)
      const [host, path] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]
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
      this.socket = io.connect(config.baseURL, { resource: 'coding-ide-tty1' })
    }

    this.backoff = getBackoff({
      delayMin: 1500,
      delayMax: 10000,
    })
    this.maxAttempts = 5

    TtySocketClient.$$singleton = this
    return this
  }

  // manually handle all connect/reconnect behavior
  connectingPromise = undefined
  connect () {
    if (!config.isPlatform) return
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
      this.socket.io.connect((err) => {
        if (err) {
          runInAction(() => config.ttySocketConnected = false)
          return this.reconnect()
        }
        // success!
        runInAction(() => config.ttySocketConnected = true)
        this.backoff.reset()
      })
      this.socket.connect()
    })
  }

  reconnect () {
    log(`try reconnect ttySocket ${this.backoff.attempts}`)
    if (this.backoff.attempts <= this.maxAttempts && !this.socket.connected) {
      const timer = setTimeout(() => {
        this.connect()
      }, this.backoff.duration())
    } else {
      warn(`TTY reconnection fail after ${this.backoff.attempts} attempts`)
      this.backoff.reset()
    }
  }

}

export { FsSocketClient, TtySocketClient }
