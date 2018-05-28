import React from 'react'
import { listen } from 'vscode-ws-jsonrpc'
import * as monaco from 'monaco-editor'
import { measure } from '@pinyin/measure'
import { createMonacoServices } from 'monaco-languageclient'
import { findModeByExtension } from 'components/Editor/components/CodeEditor/addons/mode/findMode'
import config from 'config'

import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'
import { createLanguageClient, createWebSocket } from './createHelper'

let ContentLength: string = "Content-Length: ";
let CRLF = "\r\n";

class CodeEditor extends MonacoEditor {
  constructor (props) {
    super(props)
    this.socket = null
    this.isConnect = false
    this._IDEWSURI_ = `/data/coding-ide-home/workspace/${config.spaceKey}/working-dir`
    this._OPENEDFILEURI_ = this.props.editorInfo.file.path
  }

  componentDidMount () {
    const fileName = this.editor.file.name
    const fileType = fileName.split('.').pop().toLocaleLowerCase()
    this.curLanguage = findModeByExtension(fileType) ? findModeByExtension(fileType).name.toLocaleLowerCase() : ''
    console.log(this.curLanguage, this.props.language)
    if (this.curLanguage === this.props.language) {
      console.log('========languageServer will start!')
      this.initLanguageServer(this.props)
    }
  }
  componentWillReceiveProps (nextProps) {
    // console.log(nextProps.language)
    if (this.props.language !== nextProps.language
      && nextProps.language !== ''
      && nextProps.language === this.curLanguage) {
      console.log('=======languageserver will start!')
      this.initLanguageServer(nextProps)
    }

    if (this.languageClient && this.isConnect) {
      if (nextProps.active !== this.props.active) {
        if (!nextProps.active) {
          // this.languageClient.start()
          // this.languageClient.stop()
          // this.languageClient.send
          
          // this.socket.emit('message', `${header.join(' ')}${closeParams}`)
          // console.log('激活')
        } else {
          // console.log(this.languageClient)
          // this.languageClient.start()
          console.log('restart')
        }
      }
    }
  }

  componentWillUnmount () {
    console.log('component has been unmount!')
    if (this.socket) {
      const closeParams = JSON.stringify({
        jsonrpc: '2.0',
        method: 'textDocument/didClose',
        params: {
          textDocument: {
            uri: `file://${this._IDEWSURI_}${this._OPENEDFILEURI_}`
          }
        }
      })
      const header = [
        ContentLength,
        closeParams.length.toString(),
        CRLF,
        CRLF
      ]
      this.socket.close()
      this.isConnect = false
    }
  }

  initLanguageServer = (nextProps) => {
    /**
     * 等待fetchProjectRoot完成之后设置项目mainLanguage
     * 验证config.mainLanguage和文件扩展名对应的语言相同
     * 连接socket，启动语言服务
     */
    const file = nextProps.editorInfo.file
    const { monacoEditor } = this.editor
    // const
    let model = monaco.editor.getModel(`file://${this._IDEWSURI_}${this._OPENEDFILEURI_}`)
    if (!model) {
      model = monaco.editor.createModel(file.content, 'java', monaco.Uri.parse(`file://${this._IDEWSURI_}${this._OPENEDFILEURI_}`))
    }
    // console.log(monaco.editor.getModel(`file://${IDEWSURI}${OPENEDFILEURI}`))
    // const model = monaco.editor.createModel(file.content, 'java', monaco.Uri.parse(`file://${IDEWSURI}${OPENEDFILEURI}`))
    monacoEditor.setModel(model)
    if (!this.socket) {
      this.socket = createWebSocket(`ws://127.0.0.1:9988/?ws=${config.spaceKey}`)
    }

    // socket.io与原生WebSocket做兼容
    const ioToWebSocket = {
      send: (message) => {
        this.socket.emit('message', { uri: this._OPENEDFILEURI_, message })
      },
      onerror: err => this.socket.on('error', err),
      onclose: this.socket.onclose,
      close: this.socket.close,
    }
    const services = createMonacoServices(null, { rootUri: `file://${this._IDEWSURI_}` })
    /**
     * monaco-langclient中给socket对象添加了onopen事件
     * 连接成功以后手动触发onopen
     * onmessage同理
     */
    this.socket.on('connect', () => {
      ioToWebSocket.onopen()
    })

    this.socket.on('message', ({ uri, data }) => {
      if (uri === this._OPENEDFILEURI_) {
        ioToWebSocket.onmessage({ data })
      }
    })

    listen({
      webSocket: ioToWebSocket,
      onConnection: (connection) => {
        this.languageClient = createLanguageClient(this._IDEWSURI_, services, connection, this.curLanguage)
        console.log(this.languageClient)
        const disposable = this.languageClient.start()
        connection.onClose(() => disposable.dispose())
      },
    })
    this.isConnect = true
  }
}

addMixinMechanism(CodeEditor, MonacoEditor)

export default CodeEditor
