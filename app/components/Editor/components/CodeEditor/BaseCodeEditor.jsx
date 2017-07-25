import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'

// Ref: codemirror/mode/meta.js
function getMode (file) {
  return (file.contentType && CodeMirror.findModeByMIME(file.contentType)) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

const pseudoEditor = {
  file: {
    path: '/untitled',
    content: '',
  }
}

class BaseCodeEditor extends Component {
  static defaultProps = {
    options: {
      theme: 'default',
      autofocus: true,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      dragDrop: false,
    },
    editor: pseudoEditor,
  }

  constructor (props) {
    // this base constructor always ensures the existence of `this.cm`
    super(props)
    this.state = {}
    const { editor } = props
    if (editor.cm) {
      this.cm = editor.cm
      this.cmDOM = this.cm.getWrapperElement()
    } else {
      this.cmDOM = document.createElement('div')
      Object.assign(this.cmDOM.style, { width: '100%', height: '100%' })
      const cm = this.cm = CodeMirror(this.cmDOM, { ...props.options })

      // 1. set value
      cm.setValue(editor.file.content)   // fixme: do we really want access to content and other stuffs all over the place?
      // 2. set mode
      const modeInfo = editor.file ? getMode(editor.file) : undefined
      if (modeInfo) {
        if (modeInfo.mode === 'null') {
          cm.setOption('mode', modeInfo.mode)
        } else {
          require([`codemirror/mode/${modeInfo.mode}/${modeInfo.mode}.js`],
            () => cm.setOption('mode', modeInfo.mime)
          )
        }
      }
    }
  }

  componentDidMount () {
    const cm = this.cm
    this.dom.appendChild(this.cmDOM)

    // `setSize()` and `refresh()` are required to correctly render cm
    cm.setSize('100%', '100%')
    cm.refresh()

    cm.focus()
  }

  componentWillReceiveProps ({ tab }) {
    if (tab.flags.modified || !this.cm || !tab.content) return
    if (tab.content !== this.cm.getValue()) {
      this.cm.setValue(tab.content)
    }

    const nextTheme = themeName
    const theme = this.props.themeName
    if (theme !== nextTheme) this.cm.setOption('theme', nextTheme)
  }

  render () {
    return (
      <div ref={r => this.dom = r} style={{ width: '100%', height: '100%' }} />
    )
  }
}

BaseCodeEditor.propTypes = {
  options: PropTypes.any,
  editor: PropTypes.shape({
    file: PropTypes.shape({
      content: PropTypes.string,
    }),
    cm: PropTypes.any,
  }).isRequired,
}

export default BaseCodeEditor
