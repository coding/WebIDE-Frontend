import React from 'react'
import { listen } from 'vscode-ws-jsonrpc'
import * as monaco from 'monaco-editor'
import { measure } from '@pinyin/measure'
import {
  createMonacoServices,
} from 'monaco-languageclient'

import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'


import {
  createLanguageClient,
  createWebSocket,
} from './createHelper'

const Div = measure('div')

class CodeEditor extends MonacoEditor {
  componentWillReceiveProps (newProps) {
    if (newProps.editor && this.editor === newProps.editor) return
    const { editorInfo } = newProps
    if (this.containerElement) {
      this.editor = editorInfo
      this.containerElement.replaceChild(editorInfo.monacoElement, this.editorElement)
      this.editorElement = editorInfo.monacoElement
    }
    // this.cm = this.editor.cm
    // this.cmDOM = this.cm.getWrapperElement()
    // this.dom.removeChild(this.dom.children[0])
    // this.dom.appendChild(this.cmDOM)
    // this.cm.setSize('100%', '100%')
    // this.cm.refresh()
  }
  // initialTsLanguageServer = () => {
  //   const { editor: { modeInfo: { name } } } = this.props
  //   // if (!this.editor || name.toLocaleLowerCase() !== 'javascript' || name.toLocaleLowerCase() !== 'typescript') return false
  //   const model = monaco.editor.createModel('', 'typescript', monaco.Uri.parse('file:///Users/sakura/lsp/ts-lsp-demo/index.ts'))
  //   this.editor.setModel(model)
  //   console.log('CONNECT TSSERVER...')
  //   const socketUrl = 'ws://localhost:5000/ts'
  //   const webSocket = createWebSocket(socketUrl)

  //   const services = createMonacoServices(this.editor, { rootUri: 'file:///Users/sakura/lsp/ts-lsp-demo' })

  //   listen({
  //     webSocket,
  //     onConnection: (connection) => {
  //       const languageClient = createLanguageClient(connection, services)
  //       const disposable = languageClient.start()
  //       // serverconnection = connection;
  //       connection.onClose(() => disposable.dispose())
  //     },
  //   })
  // }

}

addMixinMechanism(CodeEditor, MonacoEditor)

export default CodeEditor
