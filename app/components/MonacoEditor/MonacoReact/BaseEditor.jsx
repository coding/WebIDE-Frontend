import React from 'react'
import PropTypes from 'prop-types'
import { debounce } from 'lodash'
import { measure } from '@pinyin/measure'
import { when, autorun, reaction } from 'mobx'
import { observer } from 'mobx-react'
import * as monaco from 'monaco-editor'

import FileStore from 'commons/File/store'
import languageState from 'components/Tab/LanguageClientState'
import dispatchCommand from 'commands/dispatchCommand'
import { findLangueByExt } from '../utils/findLanguage'
import { EditorInfo } from '../state'
import initialOptions from '../monacoDefaultOptions'

function noop () {}

const Div = measure('div')
const debounced = debounce(func => func(), 1000)

@observer
class MonacoEditor extends React.Component {
  constructor (props) {
    super(props)

    let { editorInfo } = props
    if (!editorInfo) editorInfo = new EditorInfo()
    const fileExt = editorInfo.filePath ? editorInfo.filePath.split('.').pop() : ''
    this.language = findLangueByExt(fileExt) ? findLangueByExt(fileExt).language : ''
    this.editor = editorInfo
    this.editorElement = editorInfo.monacoElement
    this.containerElement = undefined
    this.currentValue = props.value

    const model = monaco.editor.getModel(this.editor.uri)

    reaction(() => initialOptions.theme, (theme) => {
      monaco.editor.setTheme(theme)
    })

    reaction(() => initialOptions.tabSize, (tabSize) => {
      if (model) {
        model.updateOptions({
          tabSize
        })
      }
    })

    autorun(() => {
      if (this.editor.monacoEditor) {
        this.editor.monacoEditor.updateOptions(initialOptions)
      }
    })
  }

  componentDidMount () {
    if (!this.containerElement) return
    this.containerElement.appendChild(this.editorElement)
    const { monacoEditor } = this.editor
    const { tab } = this.props
    monacoEditor.onDidChangeModelContent((event) => {
      const value = monacoEditor.getValue()

      this.currentValue = value

      if (this.editor.file && tab) {
        this.editor.file.isSynced = false
        FileStore.updateFile({
          id: this.editor.file.id,
          content: value,
        })
        debounced(() => {
          dispatchCommand('file:save')
        })
      }
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
      let model = monaco.editor.getModel(`file://${languageClient._ROOT_URI_}${path}`)
      if (!model) {
        model = monaco.editor.createModel(
          content,
          'java',
          monaco.Uri.parse(`file://${languageClient._ROOT_URI_}${path}`)
        )
        this.uri = `file://${languageClient._ROOT_URI_}${path}`
      }
      monacoEditor.setModel(model)

      if (this.editor.selection) {
        monacoEditor.setSelection(this.editor.selection)
      }
      const { client, openeduri } = languageClient
      if (client && client.state === 3 && this.props.active) {
        if (!languageClient.openeduri.get(path)) {
          languageClient.openTextDocument({
            textDocument: {
              uri: `file://${languageClient._ROOT_URI_}${path}`,
              languageId: this.language,
              text: content,
              version: 1,
            }
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
    const { openeduri } = languageClient
    // 组件卸载后发送 didClose消息
    if (languageClient && openeduri.get(path)) {
      languageClient.closeTextDocument({
        textDocument: {
          uri: `${languageClient._ROOT_URI_}${path}`,
        }
      })
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
