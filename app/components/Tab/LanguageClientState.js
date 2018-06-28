import { observable, when, reaction } from 'mobx'
import { listen } from 'vscode-ws-jsonrpc'
import config from 'config'
import {
  ShutdownRequest,
  ExitNotification,
  DidOpenTextDocumentNotification,
  DidCloseTextDocumentNotification,
  DidChangeWatchedFilesNotification,
} from 'vscode-base-languageclient/lib/protocol'

import { createLanguageClient as createClient } from 'components/MonacoEditor/actions'
import { JAVA_CLASS_PATH_REQUEST, LANGUAGE_STATUS } from 'components/MonacoEditor/languageRequestTypes'
import { createLanguageClient, createWebSocket, createMonacoServices } from 'components/MonacoEditor/Editors/createHelper'

const languageState = observable({
  clients: new observable.map({}),
  status: '',
  message: '',
})

/**
 * 语言服务器客户端
 * 控制本地及服务端语言服务生命周期
 */
export class LanguageClient {
  constructor (language) {
    this.language = language
    /**
     * 初始化传给语言服务的rooturi和文件uri路径不同
     * 初始化的uri可能会包含设置的项目路径
     * 文件uri本身已包含了项目路径，所以分两个。。。
     */
    this.__WORKSPACE_URI__ = config._ROOT_URI_
    this._ROOT_URI_ = config.__WORKSPACE_URI__
    this.openeduri = new observable.map({})
    this.DESTROYED = false
    this.initialize()
  }

  /**
   * 初始化语言服务客户端及服务端
   * 会发送 initialize 消息对服务端进行初始化
   */
  initialize = () => {
    this.socket = createWebSocket()
    this.ioToWebSocket = {
      send: (message) => {
        this.socket.emit('message', { message })
      },
      onerror: err => this.socket.on('error', err),
      onclose: this.socket.onclose,
      close: this.socket.close,
    }
    this.services = createMonacoServices(null, { rootUri: `file://${this.__WORKSPACE_URI__}` })
    /**
     * monaco-langclient中给socket对象添加了onopen事件
     * 连接成功以后手动触发onopen
     * onmessage同理
     */
    this.socket.on('connect', () => {
      this.ioToWebSocket.onopen()
    })

    this.socket.on('message', ({ data }) => {
      this.ioToWebSocket.onmessage({ data })
    })

    this.start()
  }

  start = () => {
    listen({
      webSocket: this.ioToWebSocket,
      onConnection: (connection) => {
        this.client = createLanguageClient(
          this.services,
          connection,
          this.curLanguage
        )
        this.client.onReady()
          .then(() => {
            let ready = false
            this.client.onNotification(LANGUAGE_STATUS, (report) => {
              languageState.status = report.type
              if (report.type === 'Starting' && !ready) {
                languageState.message = report.message
              }

              if (report.type === 'Started' && !ready) {
                languageState.message = 'Language service is ready'
                ready = true
              }

              if (report.type === 'Error') {
                languageState.message = 'Error'
              }
            })
          })
        const disposable = this.client.start()
        connection.onClose(() => disposable.dispose())
      },
    })
  }

  openTextDocument = params =>
    this.client.sendRequest(DidOpenTextDocumentNotification.type, params)

  closeTextDocument = params =>
    this.client.sendRequest(DidCloseTextDocumentNotification.type, params)

  changeWatchedFiles = params =>
    this.client.sendRequest(DidChangeWatchedFilesNotification.type, params)

  fetchJavaClassContent = params =>
    this.client.sendRequest(JAVA_CLASS_PATH_REQUEST, params)

  shutdown = () => this.client.sendRequest(ShutdownRequest.type)

  exit = () => this.client.sendRequest(ExitNotification.type)

  /**
   * 关闭语言服务
   * 首先发送 shutdown 消息要求语言服务关闭但不退出进程
   * 成功响应后发送 exit 消息要求语言服务退出进程
   * 关闭 websockete 连接
   * 并删除语言服务客户端实例
   */
  destory = () => {
    if (this.client.state >= 4) {
      return Promise.resolve(true)
    }
    return this.shutdown()
      .then(() => {
        this.DESTROYED = true
        this.exit()
        this.socket.close()
        languageState.clients.delete(this.language)
        return Promise.resolve(true)
      })
      .catch((err) => {
        throw new Error(err)
      })
  }
}

export default languageState

reaction(() => config.mainLanguage, (lang) => {
  setTimeout(() => {
    if (!languageState.clients.get(lang) && !config.switchOldEditor) {
      createClient(lang)
    }
  }, 1000)
})
