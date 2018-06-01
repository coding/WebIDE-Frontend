import { observable } from 'mobx'
import { createMonacoServices } from 'monaco-languageclient'
import { listen } from 'vscode-ws-jsonrpc'
import config from 'config'
import {
  ShutdownRequest,
  ExitNotification,
} from 'vscode-base-languageclient/lib/protocol'
import { createLanguageClient, createWebSocket } from 'components/MonacoEditor/Editors/createHelper'

const languageState = observable({
  clients: new observable.map({})
})

/**
 * 语言服务器客户端
 * 控制本地及服务端语言服务生命周期
 */
export class LanguageClient {
  constructor (language) {
    this.language = language
    this._WORKSPACE_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`
    this.openeduri = new observable.map({})
    this.initialize()
  }

  /**
   * 初始化语言服务客户端及服务端
   * 会发送 initialize 消息对服务端进行初始化
   */
  initialize = () => {
    this.socket = createWebSocket(`http://test.coding.ide/ide-ws/javalsp/sockjs/${config.spaceKey}?ws=${config.spaceKey}`)
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

  /**
   * 关闭语言服务
   * 首先发送 shutdown 消息要求语言服务关闭但不退出进程
   * 成功响应后发送 exit 消息要求语言服务退出进程
   * 关闭 websockete 连接
   * 并删除语言服务客户端实例
   */
  destory = () => {
    this.client.sendRequest(ShutdownRequest.type)
      .then(this.client.sendRequest(ExitNotification.type))
      .then(() => {
        this.socket.close()
        languageState.clients.delete(this.language)
      })
  }
}

export default languageState
