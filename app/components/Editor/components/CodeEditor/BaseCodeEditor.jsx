import React, { Component } from 'react'
import PropTypes from 'prop-types'
import CodeMirror from 'codemirror'
import { Editor } from 'components/Editor/state'

// Ref: codemirror/mode/meta.js
function getMode (file) {
  return (file.contentType && CodeMirror.findModeByMIME(file.contentType)) || CodeMirror.findModeByFileName(file.path.split('/').pop())
}

class BaseCodeEditor extends Component {
  constructor (props) {
    // this base constructor always ensures the existence of `this.cm`
    super(props)
    this.state = {}
    let { editor } = props
    if (!editor) editor = new Editor()
    this.editor = editor
    this.cm = editor.cm
    this.cmDOM = this.cm.getWrapperElement()
  }

  componentDidMount () {
    const cm = this.cm
    this.dom.appendChild(this.cmDOM)

    // `setSize()` and `refresh()` are required to correctly render cm
    cm.setSize('100%', '100%')
    cm.refresh()

    cm.focus()
  }

  render () {
    return (
      <div ref={r => this.dom = r} style={{ width: '100%', height: '100%' }} />
    )
  }
}

BaseCodeEditor.propTypes = {
  editor: PropTypes.shape({
    file: PropTypes.shape({
      content: PropTypes.string,
    }),
    options: PropTypes.any,
    cm: PropTypes.any,
  }),
}

export default BaseCodeEditor
