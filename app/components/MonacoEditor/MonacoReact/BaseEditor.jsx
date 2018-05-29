import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { measure } from '@pinyin/measure'
import { when } from 'mobx'
import { observer } from 'mobx-react'
import * as monaco from 'monaco-editor'
import {
  DidOpenTextDocumentNotification,
  DocumentSymbolRequest,
  DidCloseTextDocumentNotification,
  DidChangeWatchedFilesNotification,
} from 'vscode-base-languageclient/lib/protocol'

import languageState from 'components/Tab/LanguageClientState'
import dispatchCommand from 'commands/dispatchCommand'
import { findLangueByExt } from '../utils/findLanguage'

function noop () {}

const Div = measure('div')
const debounced = debounce(func => func(), 1000)

@observer
class MonacoEditor extends React.Component {
  constructor (props) {
    super(props)

    const { editorInfo } = props
    const fileExt = editorInfo.file.path.split('.').pop()
    this.language = findLangueByExt(fileExt) ? findLangueByExt(fileExt).language : ''
    this.editor = editorInfo
    this.editorElement = editorInfo.monacoElement
    this.containerElement = undefined
    this.currentValue = props.value
    this.state = {
      mount: false,
    }
  }

  componentDidMount () {
    if (!this.containerElement) return
    this.containerElement.appendChild(this.editorElement)
    this.setState({
      mount: true,
    })
    const { monacoEditor } = this.editor
    monacoEditor.onDidChangeModelContent((event) => {
      const value = monacoEditor.getValue()

      this.currentValue = value
      debounced(() => {
        dispatchCommand('file:save_monaco', this.currentValue)
      })
    })

    when(() => languageState.clients.get(this.language), () => {
      const languageClient = languageState.clients.get(this.language)
      const { path, content } = this.editor.file

      /**
       * client 状态
       * enum ClientState {
       *  Initial, // 0
       *  Starting, // 1
       *  StartFailed, // 2
       *  Running, // 3
       *  Stopping, // 4
       *  Stopped, // 5
       * }
       */
      let model = monaco.editor.getModel(`file://${languageClient._WORKSPACE_}${path}`)
      if (!model) {
        model = monaco.editor.createModel(
          content,
          'java',
          monaco.Uri.parse(`file://${languageClient._WORKSPACE_}${path}`)
        )
      }
    // console.log(monaco.editor.getModel(`file://${IDEWSURI}${OPENEDFILEURI}`))
    // const model = monaco.editor.createModel(file.content, 'java', monaco.Uri.parse(`file://${IDEWSURI}${OPENEDFILEURI}`))
      monacoEditor.setModel(model)

      if (this.editor.selection) {
        monacoEditor.setSelection(this.editor.selection)
        monacoEditor.focus()
      }
      const { client, openeduri } = languageClient
      if (client && client.state === 3 && this.props.active) {
        if (languageClient.openeduri.get(path)) {
          // 当前文件已发送过 didOpen 消息
          client.sendRequest(DocumentSymbolRequest.type, {
            uri: `file://${languageClient._WORKSPACE_}${path}`
          })
        } else if (!openeduri.get(path)) {
          client.sendRequest(DidOpenTextDocumentNotification.type, {
            textDocument: {
              uri: `file://${languageClient._WORKSPACE_}${path}`,
              languageId: this.language,
              text: content,
              version: 1,
            }
          })
          client.sendRequest(DidChangeWatchedFilesNotification.type, {
            changes: [{
              uri: `file://${languageClient._WORKSPACE_}/pom.xml`,
              type: 2
            }]
          })
          openeduri.set(path, content)
        }
      }
    })
  }

  componentWillUnmount () {
    const languageClient = languageState.clients.get(this.language)
    if (!languageClient) return
    const { path } = this.editor.file
    const { client, openeduri } = languageClient
    // 组件卸载后发送 didClose消息
    if (languageClient && openeduri.get(path)) {
      client.sendRequest(
        DidCloseTextDocumentNotification.type,
        {
          textDocument: {
            uri: `${languageClient._WORKSPACE_}${path}`,
          }
        }
      )
      languageClient.openeduri.delete(path)
    }
  }

  handleResize = () => {
    if (!this.editor.monacoEditor) return
    this.editor.monacoEditor.layout()
  }

  destroyMonaco () {
    if (typeof this.editor !== 'undefined') {
      this.editor.dispose()
    }
  }

  assignRef = (component) => {
    this.containerElement = component
  }

  render () {
    const { width, height } = this.props
    const fixedWidth = width.toString().indexOf('%') !== -1 ? width : `${width}px`
    const fixedHeight = height.toString().indexOf('%') !== -1 ? height : `${height}px`
    const style = {
      width: fixedWidth,
      height: fixedHeight
    }

    return (<Div
      style={{ width: '100%', height: '100%' }}
      onWidthChange={this.handleResize}
      onHeightChange={this.handleResize}
    >
      <div className='react-monaco-editor-container' ref={this.assignRef} style={style} />
    </Div>)
  }
}

MonacoEditor.propTypes = {
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  value: PropTypes.string,
}

MonacoEditor.defaultProps = {
  width: '100%',
  height: '100%',
  value: null,
  defaultValue: '',
  language: 'javascript',
  theme: null,
  options: {},
  editorDidMount: noop,
  editorWillMount: noop,
  onChange: noop,
  requireConfig: {},
}

export default MonacoEditor
