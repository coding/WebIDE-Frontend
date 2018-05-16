import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import CodeEditor from './CodeEditor'

const EditorWrapper = observer(({ tab, active }) => {
  // if (!active) return null

  const { editor, editorInfo } = tab
  const editorType = editor.editorType || 'default'
  const file = editor.file || {}
  // key is crutial here, it decides whether
  // the component should re-construct or
  // keep using the existing instance.
  const key = `editor_${file.path}`
  switch (editorType) {
    case 'htmlEditor':
      return React.createElement(CodeEditor, { editor, editorInfo, key, tab, active })
    case 'default':
      return React.createElement(CodeEditor, { editor, editorInfo, key, tab, active })
    case 'editorWithPreview':
      return React.createElement(CodeEditor, { editor, editorInfo, key, tab, active })
    case 'imageEditor':
      return <div>this is a image.</div>
    default:
      return React.createElement(CodeEditor, { path: file.path, size: file.size, key, tab, active })
  }
})

EditorWrapper.propTypes = {
  tab: PropTypes.object
}

EditorWrapper.contextTypes = {
  i18n: PropTypes.func
}

export default EditorWrapper

export {
  CodeEditor,
}
