import { observable, reaction } from 'mobx'
import { listen } from 'vscode-ws-jsonrpc'
import { lowerCase } from 'lodash'
import config from 'config'
import {
  ShutdownRequest,
  ExitNotification,
  DidOpenTextDocumentNotification,
  DidCloseTextDocumentNotification,
  DidChangeWatchedFilesNotification,
  DidChangeWorkspaceFoldersNotification,
  WorkspaceFoldersRequest,
} from 'vscode-languageserver-protocol'

import { createLanguageClient as createClient } from 'components/MonacoEditor/actions'
import { createLanguageClient, createWebSocket, createMonacoServices } from 'components/MonacoEditor/Editors/createHelper'
import {
  JAVA_CLASS_PATH_REQUEST,
  LANGUAGE_STATUS,
  WORKSPACE_EXECUTECOMMAND,
  JAVA_START_DEBUGSESSION,
  JAVA_BUIILDWORKSPACE,
  JAVA_RESOLVE_CLASSPATH,
  JAVA_FETCH_USAGE_DATA,
  JAVA_RESOLVE_MAINCLASS,
  JAVA_UPDATE_DEBUG_SETTINGS,
  JAVA_PROJECT_CONFIGURATION_UPDATE,
  LANGUAGE_PROGRESS_REPORT,
} from 'components/MonacoEditor/languageRequestTypes'
import { emitter } from 'utils'
import isConfigFile from './utils/isConfigFile'

const languageState = observable({
  clients: new observable.map({}),
  status: '',
  message: '',
})


/** 客户端状态
  enum ClientState {
    Initial,     0
    Starting,    1
    StartFailed, 2
    Running,     3
    Stopping,    4
    Stopped      5
  }
 */
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
    this.client = null
    this.initialize()
    emitter.on('file:save', this.fileSaveMiddleware)
  }

  fileSaveMiddleware = (ctx) => {
    const { data } = ctx
    if (isConfigFile[lowerCase(this.language)]) {
      const configFileVerification = isConfigFile[lowerCase(this.language)]
      if (configFileVerification(data)) {
        const absolutePath = `file://${this.__WORKSPACE_URI__}${data}`
        this.javaProjectConfigurationUpdate(absolutePath)
      }
    }
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
            this.ready = false
            this.client.onNotification(LANGUAGE_STATUS, this.onLanguageStatus)
            this.client.onNotification(LANGUAGE_PROGRESS_REPORT, this.onLanguageProgressReport)
          })
        const disposable = this.client.start()
        connection.onClose(() => disposable.dispose())
      },
    })
  }

  onLanguageProgressReport = (report) => {
    const { status, complete } = report
    languageState.message = status
    if (complete) {
      const timer = setTimeout(() => {
        languageState.message = ''
        clearTimeout(timer)
      }, 500)
    }
  }

  onLanguageStatus = (report) => {
    languageState.status = report.type
    if (report.type === 'Starting' && !this.ready) {
      languageState.message = report.message
    }

    if (report.type === 'Started' && !this.ready) {
      languageState.message = 'Language service is ready'
      this.ready = true
      setTimeout(() => languageState.message = '', 3000)
    }

    if (report.type === 'Error') {
      languageState.message = 'Error'
    }
  }

  workSpaceFolder = params =>
    this.client.sendRequest(WorkspaceFoldersRequest.type, params)

  workSpaceFoldersChange = params =>
    this.client.sendNotification(DidChangeWorkspaceFoldersNotification.type, params)

  openTextDocument = params =>
    this.client.sendNotification(DidOpenTextDocumentNotification.type, params)

  closeTextDocument = params =>
    this.client.sendNotification(DidCloseTextDocumentNotification.type, params)

  changeWatchedFiles = params =>
    this.client.sendNotification(DidChangeWatchedFilesNotification.type, params)

  fetchJavaClassContent = params =>
    this.client.sendRequest(JAVA_CLASS_PATH_REQUEST, params)

  shutdown = () => this.client.sendRequest(ShutdownRequest.type)

  exit = () => this.client.sendNotification(ExitNotification.type)

  javaProjectConfigurationUpdate = uri => this.client.sendNotification(JAVA_PROJECT_CONFIGURATION_UPDATE, { uri })

  resolveMainClass = () => this.client.sendRequest(WORKSPACE_EXECUTECOMMAND, {
    command: JAVA_RESOLVE_MAINCLASS,
    arguments: [`file://${this.__WORKSPACE_URI__}`],
  })

  fetchUsageData = () => this.client.sendRequest(WORKSPACE_EXECUTECOMMAND, {
    command: JAVA_FETCH_USAGE_DATA,
    arguments: []
  })

  buildJavaWorkspace = () => this.client.sendRequest(JAVA_BUIILDWORKSPACE, true)

  resolveClassPath = (mainClass) => this.client.sendRequest(WORKSPACE_EXECUTECOMMAND, {
    command: JAVA_RESOLVE_CLASSPATH,
    arguments: [
      mainClass,
      null
    ]
  })

  updateJavaDebugConfig = (params) => this.client.sendRequest(WORKSPACE_EXECUTECOMMAND, {
    command: JAVA_UPDATE_DEBUG_SETTINGS,
    arguments: [params],
  })

  startJavaDebugSession = () => this.client.sendRequest(WORKSPACE_EXECUTECOMMAND, {
    command: JAVA_START_DEBUGSESSION,
    arguments: []
  })
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
        languageState.status = 'Stopped'
        languageState.message = ''
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
