import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import { CodeMirrorAdapter, Selection, TextOperation, WrappedOperation, UndoManager } from 'utils/ot'

// Ref: codemirror/mode/meta.js
function getMode (file) {
  return CodeMirror.findModeByMIME(file.contentType) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

class CodeMirrorEditor extends Component {
  static defaultProps = {
    themeName: 'default',
    options: {
      autofocus: true,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    }
  }

  constructor (props) {
    // this base constructor always ensures the existence of `this.cm`
    super(props)

    const { editor } = props
    if (editor.cm) {
      this.cm = editor.cm
      this.cmDOM = this.cm.getWrapperElement()
    } else {
      const cmDOM = this.cmDOM = document.createElement('div')
      Object.assign(cmDOM.style, { width: '100%', height: '100%' })
      const cm = this.cm = CodeMirror(cmDOM, { ...props.options, theme: props.themeName })

      // 1. fix an incompatibility
      cm.on('dragover', (cm, e) => e.preventDefault())  // todo: make our drag_to_split feature compatible with default open_file_ondrop
      // 2. set value
      cm.setValue(editor.content)   // fixme: do we really want access to content and other stuffs all over the place?
      // 3. set mode
      const modeInfo = editor.file ? getMode(editor.file) : undefined
      if (modeInfo) {
        if (modeInfo.mode === 'null') {
          cm.setOption('mode', modeInfo.mode)
        } else {
          require([`codemirror/mode/${modeInfo.mode}/${modeInfo.mode}.js`], () => cm.setOption('mode', modeInfo.mime))
        }
      }
    }
  }

  componentDidMount () {
    const cm = this.cm
    this.dom.appendChild(this.cmDOM)

    cm.focus()
    cm.on('change', this.onChange)
    cm.on('focus', this.onFocus)
  }

  // onChange = (e) => {
  //   if (!this.isChanging) this.isChanging = true
  //   const { tab, file } = this.props
  //   TabStore.updateTab({
  //     id: tab.id,
  //     flags: { modified: true },
  //   })
  //   if (file) debounced(() => {
  //     FileStore.updateFile({
  //       id: file.id,
  //       content: this.cm.getValue(),
  //     })
  //     dispatchCommand('file:save')
  //     this.isChanging = false
  //   })
  // }

  // onFocus = () => {
  //   TabStore.activateTab(this.props.tab.id)
  // }

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
    this.dispose()
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
  editor: PropTypes.shape({
    file: PropTypes.shape({
      content: PropTypes.string,
    }),
    cm: PropTypes.any,
  }).isRequired,
  file: PropTypes.object,
}

export default CodeMirrorEditor
