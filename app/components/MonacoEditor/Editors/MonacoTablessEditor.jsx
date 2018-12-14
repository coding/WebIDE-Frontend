import MonacoEditor from '../MonacoReact/BaseEditor'
import TabStore from 'components/Tab/store'
class MonacoTablessEditor extends MonacoEditor {
  componentDidMount () {
    super.componentDidMount()
    if (this.editor.monacoEditor) {
      const { monacoEditor } = this.editor
      this.dispose = monacoEditor.onDidChangeModelContent((event) => {
        if (!this.props.tab) {
          TabStore.createTab({
            flags: { modified: true },
            tabGroup: { id: this.props.tabGroupId },
            editor: {
              content: monacoEditor.getValue(),
              autoFocus: true,
              ...this.editor,
            },
          })
        }
      })
    }
  }

  componentWillUnmount () {
    if (this.dispose) {
      this.dispose.dispose()
    }
  }
  // render () {
  //   return <div>welcome cloud studio</div>
  // }
}

export default MonacoTablessEditor
