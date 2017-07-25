import BaseCodeEditor from './BaseCodeEditor'
import addMixinMechanism from './addMixinMechanism'
import basicMixin from './basicMixin'

class CodeEditor extends BaseCodeEditor {
  constructor (props, context) {
    super(props, context)
  }
}
addMixinMechanism(CodeEditor, BaseCodeEditor)


CodeEditor.use(basicMixin)

export default CodeEditor
