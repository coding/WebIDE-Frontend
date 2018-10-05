import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'
import emitter, * as E from 'utils/emitter'
import config from 'config'
import { autorun, runInAction } from 'mobx'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'

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
    emitter.on(E.SOCKET_RETRY, this.reconnect.bind(this))
  }

  connect () {
    if (!this.socket || !this.stompClient) {
      this.socket = new SockJS(...this.sockJSConfigs)
      this.stompClient = Stomp.over(this.socket)
      this.stompClient.debug = false // stop logging PING/PONG
    }
    const success = () => {
      runInAction(() => config.fsSocketConnected = true)
      this.backoff.reset()
      this.successCallback(this.stompClient)
    }
    const error = (frame) => {
      log('fsSocket error', this.socket)
      switch (this.socket.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          runInAction(() => config.fsSocketConnected = false)
          this.reconnect()
          break
        case SockJS.OPEN:
          log('FRAME ERROR', frame)
          break
        default:
      }
      this.errorCallback(frame)
    }

    this.stompClient.connect({}, success, error)
  }

  reconnect () {
    if (config.fsSocketConnected) return
    log(`try reconnect fsSocket ${this.backoff.attempts}`)
    // unset this.socket
    this.socket = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
      const retryDelay = this.backoff.duration()
      log(`Retry after ${retryDelay}ms`)
      const timer = setTimeout(
        this.connect.bind(this)
      , retryDelay)
    } else {
      emitter.emit(E.SOCKET_TRIED_FAILED)
      notify({ message: i18n`global.onSocketError`, notifyType: NOTIFY_TYPE.ERROR })
      this.backoff.reset()
      warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }

  close () {
    const self = this
    if (config.fsSocketConnected) {
      self.socket.close(1000, 123)
      runInAction(() => config.fsSocketConnected = false)
    }
  }
}


class TtySocketClient {
  constructor () {
    if (TtySocketClient.$$singleton) return TtySocketClient.$$singleton
    if (config.isPlatform) {
      const host=window.location.hostname, path=window.serverConfig.WS_URL
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
    emitter.on(E.SOCKET_RETRY, () => {
      this.reconnect()
    })
    return this
  }

  // manually handle all connect/reconnect behavior
  connectingPromise = undefined
  connect () {
    if (!config.isPlatform) return
    // Need to make sure EVERY ATTEMPT to connect has ensured `fsSocketConnected == true`
    if (!this.socket || this.socket.connected || this.connectingPromise) return this.connectingPromise
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
  close () {
    if (config.ttySocketConnected) {
      this.socket.disconnect('manual')
      TtySocketClient.$$singleton = null
    }
  }
}

export { FsSocketClient, TtySocketClient }
