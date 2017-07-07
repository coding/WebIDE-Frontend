import config from 'config'
import OTWebsocketClient from './OTWebsocketClient'

const client = new OTWebsocketClient()
client.mysubscribe = function () {
  client.stompClient.subscribe(`/topic/${config.spaceKey}/updated`, (frame) => {

  })

  client.stompClient.subscribe(`/topic/${config.spaceKey}/committed`, (frame) => {

  })
}

window.otclient = client

// client.send(`/app/${config.spaceKey}/write`, headers, body)
// client.send(`/app/${config.spaceKey}/history`, headers, body)
