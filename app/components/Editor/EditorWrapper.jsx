import React, { PropTypes } from 'react'
import { observer } from 'mobx-react'
import CodeEditor from './components/CodeEditor'
import MarkdownEditor from './components/MarkdownEditor'
import ImageEditor from './components/ImageEditor'
import UnknownEditor from './components/UnknownEditor'
import WelcomeEditor from './components/WelcomeEditor'

const EditorWrapper = observer(({ tab }) => {
  const { editor } = tab
  const editorType = editor.editorType || 'default'
  const file = editor.file || {}
  switch (editorType) {
    case 'default':
      return React.createElement(CodeEditor, { editor })
    case 'editorWithPreview':
      return React.createElement(MarkdownEditor, { editor })
    case 'imageEditor':
      return React.createElement(ImageEditor, { path: file.path })
    default:
      return React.createElement(UnknownEditor, { path: file.path, size: file.size })
  }
})

EditorWrapper.propTypes = {
  tab: PropTypes.object
}

EditorWrapper.contextTypes = {
  i18n: React.PropTypes.func
}

export default EditorWrapper
