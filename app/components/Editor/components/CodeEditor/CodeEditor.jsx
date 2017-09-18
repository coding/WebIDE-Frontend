import BaseCodeEditor from './BaseCodeEditor'
import addMixinMechanism from './addMixinMechanism'
import basicMixin from './mixins/basicMixin'
import gitBlameMixin from './mixins/gitBlameMixin'

class CodeEditor extends BaseCodeEditor {
  componentWillReceiveProps (newProps) {
    if (newProps.editor && this.editor === newProps.editor) return
    this.editor = newProps.editor
    this.cm = this.editor.cm
    this.cmDOM = this.cm.getWrapperElement()
    this.dom.removeChild(this.dom.children[0])
    this.dom.appendChild(this.cmDOM)
    this.cm.setSize('100%', '100%')
    this.cm.refresh()
  }
}
addMixinMechanism(CodeEditor, BaseCodeEditor)

CodeEditor.use(basicMixin)
CodeEditor.use(gitBlameMixin)

export default CodeEditor
