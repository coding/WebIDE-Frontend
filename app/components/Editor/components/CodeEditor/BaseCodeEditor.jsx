import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Editor } from 'components/Editor/state'

class BaseCodeEditor extends Component {
  constructor (props) {
    // this base constructor always ensures the existence of `this.cm`
    super(props)
    this.state = {}
    let { editor } = props
    if (!editor) editor = new Editor()
    this.editor = editor
    this.cm = this.editor.cm
    this.cmDOM = this.cm.getWrapperElement()
  }

  componentDidMount () {
    const cm = this.cm
    this.dom.appendChild(this.cmDOM)

    // `setSize()` and `refresh()` are required to correctly render cm
    cm.setSize('100%', '100%')
    cm.refresh()
    const scrollLine = this.editor.scrollLine
    setTimeout(() => {
      cm.scrollIntoView({ line: scrollLine, ch: 0 })
      cm.focus()
    }, 0)
  }

  render () {
    return (
      <div ref={r => this.dom = r} style={{ width: '100%', height: '100%' }} />
    )
  }

  componentWillUnmount () {
    const async = true
    this.editor.destroy(async)
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
