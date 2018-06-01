// import { Component } from 'react'
import TabStore from 'components/Tab/store'
import MonacoEditor from '../MonacoReact/BaseEditor'

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
              ...this.editor,
            },
          })
        }
      })
    }
  }
}

export default MonacoTablessEditor
