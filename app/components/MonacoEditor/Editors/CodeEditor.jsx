// import React from 'react'
import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'

class CodeEditor extends MonacoEditor {
  componentWillReceiveProps (nextProps) {
    const { editorInfo } = nextProps
    if (editorInfo && this.editor === editorInfo) return
    if (editorInfo && this.containerElement) {
      const prevElement = this.props.editorInfo.monacoElement
      this.containerElement.replaceChild(editorInfo.monacoElement, prevElement)
    }
  }
}

addMixinMechanism(CodeEditor, MonacoEditor)

export default CodeEditor
