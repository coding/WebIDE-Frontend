import { Stomp } from 'stompjs/lib/stomp'
import SockJS from 'sockjs-client'
import getBackoff from 'utils/getBackoff'

/*
interface BaseWebSocketClient {
  id?: String,
  baseURL: String,
  spaceKey: String,
  successCallback(),
  errorCallback(),
}
*/

class BaseWebSocketClient {
  constructor () {
    if (!this.backoff) this.backoff = getBackoff({ delayMin: 50, delayMax: 5000 })
    if (!this.maxAttempts) this.maxAttempts = 8
  }

  connect () {
    if (!this.ws || !this.client) {
      this.ws = new SockJS(this.baseURL + this.spaceKey, {},
        { server: this.spaceKey, transports: 'websocket' }
      )
      this.client = Stomp.over(this.ws)
      this.client.debug = false // stop console.logging PING/PONG
    }

    const success = () => {
      this.backoff.reset()
      this.successCallback(this.client)
    }
    const error = (...args) => {
      switch (this.ws.readyState) {
        case SockJS.CLOSING:
        case SockJS.CLOSED:
          this.reconnect()
          break
        case SockJS.OPEN:
          console.log('FRAME ERROR', args[0])
          break
        default:
      }
      this.errorCallback(args)
    }

    const headers = this.headers || {}
    this.client.connect(headers, success, error)
  }

  reconnect () {
    // unset this.ws
    this.ws = undefined
    if (this.backoff.attempts <= this.maxAttempts) {
      const retryDelay = this.backoff.duration()
      setTimeout(this.connect.bind(this), retryDelay)
    } else { // exceed maxAttempts
      this.backoff.reset()
      // todo: insert here notify or other Call-To-Action
      console.warn('Sock connected failed, something may be broken, reload page and try again')
    }
  }

  send (...args) {
    return this.client.send(...args)
  }
}


export default BaseWebSocketClient
