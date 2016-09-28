/* @flow weak */
import {Stomp} from 'stompjs/lib/stomp.js'
import SockJS from 'sockjs-client'
import config from '../config'

var retryDelay = 50
var retry = 0
var connected = false

const _getRetryDelay = () => {
  if (retryDelay < 5000) {
    retryDelay = retryDelay * 2
  } else {
    retryDelay = 5000
  }
  return retryDelay
}

const _resetRetryDelay = () => {
  return retryDelay = 50
}

const Client = {
  connect: function (connectCallback, errorCallback) {
    var socket = new SockJS(`${config.baseURL}/sockjs/`, {}, {server: `${config.spaceKey}`, transports: 'websocket'})
    var stompClient = Stomp.over(socket)

    return stompClient.connect({},
      function () {
        connected = true
        _resetRetryDelay()
        return connectCallback.call(this)
      }, () => {
        errorCallback(arguments)
        retry++
        if (retry < 8 && !connected) {
          console.log('Retry after ' + retryDelay + 'ms')
          return setTimeout(this.connect.bind(this, connectCallback, errorCallback), _getRetryDelay())
        } else {
          return console.warn('Sock connected failed, something may be broken, reload page and try again')
        }
      }
    )
  }
}

module.exports = Client
