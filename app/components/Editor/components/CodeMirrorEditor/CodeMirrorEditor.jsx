import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import TabStore from 'components/Tab/store'
import FileStore from 'commons/File/store'
import dispatchCommand from 'commands/dispatchCommand'
import debounce from 'lodash/debounce'
import { defaultProps } from 'utils/decorators'
import { observer } from 'mobx-react'
import EditorClient from 'utils/ot/EditorClient'

const debounced = debounce(func => func(), 1000)
// Ref: codemirror/mode/meta.js
function getMode (file) {
  return CodeMirror.findModeByMIME(file.contentType) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

@defaultProps(({ tab }) => ({
  editor: tab.editor || null,
  file: tab.editor ? tab.editor.file : null,
}))
@observer
class CodeMirrorEditor extends Component {
  static defaultProps = {
    themeName: 'default',
    options: {
      gutters: ['CodeMirror-linenumbers'],
      autofocus: true,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    }
  }

  // this base constructor always ensures the existence
  // of `this.cm` and `this.cmDOM`
  constructor (props) {
    super(props)

    const { editor, file } = props
    let cm, cmDOM
    if (editor.cm) {
      cm = editor.cm
      cmDOM = cm.getWrapperElement()
    } else {
      cmDOM = document.createElement('div')
      Object.assign(cmDOM.style, { width: '100%', height: '100%' })
      cm = CodeMirror(cmDOM, { ...props.options, theme: props.themeName })
      // 1. fix an incompatibility
      cm.on('dragover', (cm, e) => e.preventDefault())  // todo: make our drag_to_split feature compatible with default open_file_ondrop
      // 2. set value
      cm.setValue(editor.content)   // fixme: do we really want access to content and other stuffs all over the place?
      // 3. set mode
      const modeInfo = file ? getMode(file) : undefined
      if (modeInfo) {
        if (modeInfo.mode === 'null') {
          cm.setOption('mode', modeInfo.mode)
        } else {
          require([`codemirror/mode/${modeInfo.mode}/${modeInfo.mode}.js`], () => cm.setOption('mode', modeInfo.mime))
        }
      }
    }

    this.cmDOM = cmDOM
    this.cm = editor.cm = cm
  }

  componentDidMount () {
    const cm = this.cm
    this.dom.appendChild(this.cmDOM)
    // `setSize()` and `refresh()` are required to correctly render cm
    cm.setSize('100%', '100%')
    cm.refresh()

    cm.focus()
    cm.on('change', this.onChange)
    cm.on('focus', this.onFocus)
    this.editorClient = new EditorClient(this.props.editor)
  }

  componentWillReceiveProps ({ tab, themeName }) {
    if (tab.flags.modified || !this.cm || !tab.content) return
    if (tab.content !== this.cm.getValue()) {
      this.cm.setValue(tab.content)
    }

    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.cm.setOption('theme', nextTheme)
  }

  componentWillUnmount () {
    this.cm.off('change', this.onChange)
    this.cm.off('focus', this.onFocus)
  }

  onChange = (cm, e) => {
    if (!this.isChanging) this.isChanging = true
    const { tab, file } = this.props
    TabStore.updateTab({
      id: tab.id,
      flags: { modified: true },
    })
    if (file) debounced(() => {
      FileStore.updateFile({
        id: file.id,
        content: this.cm.getValue(),
      })
      dispatchCommand('file:save')
      this.isChanging = false
    })
  }

  onFocus = (cm, e) => {
    TabStore.activateTab(this.props.tab.id)
  }

  render () {
    return (
      <div ref={r => this.dom = r} style={{ width: '100%', height: '100%' }} />
    )
  }
}

CodeMirrorEditor.propTypes = {
  themeName: PropTypes.string,
  options: PropTypes.any,
  tab: PropTypes.any,
  editor: PropTypes.any,
  file: PropTypes.any,
}

export default CodeMirrorEditor
