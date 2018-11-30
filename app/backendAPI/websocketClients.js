import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'
import emitter, * as E from 'utils/emitter'
import config from 'config'
import { autorun, runInAction } from 'mobx'
import { notify, NOTIFY_TYPE } from '../components/Notification/actions'
import * as searchAPI from 'backendAPI/searchAPI'

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
    this.shouldClose = false;
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
      if (this.shouldClose) {
        this.shouldClose = false;
        return;
      }
      log('[FS Socket] FsSocket error', this.socket)
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
    log(`[FS Socket] Try reconnect fsSocket ${this.backoff.attempts}`)
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
      self.shouldClose = true;
      self.socket.close();
      emitter.emit(E.SOCKET_TRIED_FAILED);
      runInAction(() => config.fsSocketConnected = false);
    }
    if (TtySocketClient.$$singleton) {
      TtySocketClient.$$singleton.close();
    }
    if(SearchSocketClient.$$singleton) {
      SearchSocketClient.$$singleton.close();
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
    log(`[TTY Socket] Try reconnect ttySocket ${this.backoff.attempts}`)
    if (this.backoff.attempts <= this.maxAttempts && !this.socket.connected) {
      const timer = setTimeout(() => {
        this.connect()
        clearTimeout(timer)
      }, this.backoff.duration())
    } else {
      warn(`[TTY Socket] TTY reconnection fail after ${this.backoff.attempts} attempts`)
      this.backoff.reset()
    }
  }
  close () {
    if (config.ttySocketConnected) {
      this.socket.disconnect('manual')
      // TtySocketClient.$$singleton = null
    }
  }
}

class SearchSocketClient {
  constructor () {
      if (SearchSocketClient.$$singleton) return SearchSocketClient.$$singleton

      const wsUrl = config.wsURL
      const firstSlashIdx = wsUrl.indexOf('/', 8)
      const [host, path] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]
      
      // const url = `${host}:8066/search/sockjs`
      const url = `${host}${path}/search/sockjs/${config.spaceKey}`
      // http://dev.coding.ide/ide-ws/search/sockjs/kfddvb/info
      this.sockJSConfigs = [url, {}, {server: `${config.spaceKey}`, transports: 'websocket'}]

      this.backoff = getBackoff({
        delayMin: 1500,
        delayMax: 10000,
      })
      this.maxAttempts = 5
  
      SearchSocketClient.$$singleton = this
      emitter.on(E.SOCKET_RETRY, () => {
        this.reconnect()
      })
  }

  connect () {
    if (!this.socket || !this.stompClient) {
      this.socket = new SockJS(...this.sockJSConfigs)
      this.stompClient = Stomp.over(this.socket)
      this.stompClient.debug = false // stop logging PING/PONG
    }
    const success = () => {
      runInAction(() => config.searchSocketConnected = true)
      this.backoff.reset()
      this.successCallback(this.stompClient)
    }
    const error = (frame) => {
      if (this.shouldClose) {
        this.shouldClose = false;
        return;
      }
      log('[SEARCH Socket] SearchSocket error', this.socket)
      switch (this.socket.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          runInAction(() => config.searchSocketConnected = false)
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
    if (config.searchSocketConnected) return
    log(`[SEARCH Socket] reconnect searchSocket ${this.backoff.attempts}`)
    // unset this.socket
    this.socket = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
      const retryDelay = this.backoff.duration()
      log(`Retry after ${retryDelay}ms`)
      const timer = setTimeout(
        this.connect.bind(this)
      , retryDelay)
    } else {
      // must emit ，ops correct?
      // emitter.emit(E.SOCKET_TRIED_FAILED)
      notify({ message: i18n`global.onSocketError`, notifyType: NOTIFY_TYPE.ERROR })
      this.backoff.reset()
      warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }

  close () {
    const self = this
    if (config.searchSocketConnected) {
      searchAPI.searchWorkspaceDown();
      self.shouldClose = true;
      self.socket.close();
      // must emit ???
      // emitter.emit(E.SOCKET_TRIED_FAILED);
      runInAction(() => config.searchSocketConnected = false);
    }
  }

  subscribe = (topic, process) => {
      this.stompClient.subscribe(topic, process);
  }

  send = (mapping, headers, data) => {
      this.stompClient.send(mapping, headers, data);
  }
}


export { FsSocketClient, TtySocketClient, SearchSocketClient }
