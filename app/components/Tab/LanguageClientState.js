import { observable } from 'mobx'
import { createMonacoServices } from 'monaco-languageclient'
import { listen } from 'vscode-ws-jsonrpc'

import config from 'config'
import { createLanguageClient, createWebSocket } from 'components/MonacoEditor/Editors/createHelper'

const languageState = observable({
  clients: new observable.map({})
})

export class LanguageClient {
  constructor (language) {
    this.language = language
    this._WORKSPACE_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`
    this.openeduri = new observable.map({})
    this.initialize()
  }

  initialize = () => {
    this.socket = createWebSocket(`ws://127.0.0.1:9988/?ws=${config.spaceKey}`)
    const ioToWebSocket = {
      send: (message) => {
        this.socket.emit('message', { message })
      },
      onerror: err => this.socket.on('error', err),
      onclose: this.socket.onclose,
      close: this.socket.close,
    }
    const services = createMonacoServices(null, { rootUri: `file://${this._WORKSPACE_}` })
    /**
     * monaco-langclient中给socket对象添加了onopen事件
     * 连接成功以后手动触发onopen
     * onmessage同理
     */
    this.socket.on('connect', () => {
      ioToWebSocket.onopen()
    })

    this.socket.on('message', ({ uri, data }) => {
      ioToWebSocket.onmessage({ data })
    })

    listen({
      webSocket: ioToWebSocket,
      onConnection: (connection) => {
        this.client = createLanguageClient(this._WORKSPACE_, services, connection, this.curLanguage)
        const disposable = this.client.start()
        connection.onClose(() => disposable.dispose())
      },
    })
  }
}

export default languageState
