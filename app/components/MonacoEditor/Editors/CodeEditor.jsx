// import React from 'react'
import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'

class CodeEditor extends MonacoEditor {
  componentWillReceiveProps (nextProps) {
    // super.componentWillReceiveProps(nextProps)
    const { editorInfo } = nextProps
    if (editorInfo && this.containerElement) {
      const prevElement = this.props.editorInfo.monacoElement
      this.containerElement.replaceChild(editorInfo.monacoElement, prevElement)
    }
    // console.log(nextProps)
  }
  // TODO
}

addMixinMechanism(CodeEditor, MonacoEditor)

export default CodeEditor
