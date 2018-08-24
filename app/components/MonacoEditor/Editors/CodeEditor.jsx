// import React from 'react'
import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'
import MergeConflictMinxin from '../mergeConflictMinxin'

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

CodeEditor.use(MergeConflictMinxin)

export default CodeEditor
