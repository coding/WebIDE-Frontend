import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'
import config from 'config'

class OTWebsocketClient {
  constructor () {
    if (OTWebsocketClient.$$singleton) return OTWebsocketClient.$$singleton
    // SockJS auto connects at initiation
    this.backoff = getBackoff({
      delayMin: 50,
      delayMax: 5000,
    })
    this.maxAttempts = 7
    OTWebsocketClient.$$singleton = this
  }

  connect (connectCallback, errorCallback) {
    const self = this
    if (!this.socket || !this.stompClient) {
      this.socket = new SockJS(`${config.wsURL}/ot/sockjs/${config.spaceKey}`, {}, {
        server: `${config.spaceKey}`,
        transports: 'websocket',
      })
      this.stompClient = Stomp.over(this.socket)
      this.stompClient.debug = false // stop console.logging PING/PONG
    }
    self.stompClient.connect({}, function success () {
      self.backoff.reset()
      connectCallback.call(this)
    }, function error () {
      console.log('OT websocket error')
      switch (self.socket.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          self.reconnect(connectCallback, errorCallback)
          break
        case SockJS.OPEN:
          console.log('FRAME ERROR', arguments[0])
          break
        default:
      }
      errorCallback(arguments)
    })
  }

  reconnect (connectCallback, errorCallback) {
    if (config.fsSocketConnected) return
    console.log(`try reconnect OT websocket ${this.backoff.attempts}`)
    // unset this.socket
    this.socket = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
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

export default OTWebsocketClient
