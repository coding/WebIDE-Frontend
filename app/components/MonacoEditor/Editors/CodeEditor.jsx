// import React from 'react'
import addMixinMechanism from './addMixinMechanism'
import MonacoEditor from '../MonacoReact/BaseEditor'

class CodeEditor extends MonacoEditor {
  componentWillReceiveProps (nextProps) {
  }
  // TODO
}

addMixinMechanism(CodeEditor, MonacoEditor)

export default CodeEditor
