import BaseCodeEditor from './BaseCodeEditor'
import addMixinMechanism from './addMixinMechanism'
import basicMixin from './mixins/basicMixin'
import gitBlameMixin from './mixins/gitBlameMixin'

class CodeEditor extends BaseCodeEditor {
  constructor (props, context) {
    super(props, context)
  }
}
addMixinMechanism(CodeEditor, BaseCodeEditor)

CodeEditor.use(basicMixin)
CodeEditor.use(gitBlameMixin)

export default CodeEditor
