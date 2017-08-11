import React, { PropTypes } from 'react'
import CodeEditor from './components/CodeEditor'
import MarkdownEditor from './components/MarkdownEditor'
import ImageEditor from './components/ImageEditor'
import UnknownEditor from './components/UnknownEditor'
import WelcomeEditor from './components/WelcomeEditor'

const editors = {
  CodeEditor,
  MarkdownEditor,
  ImageEditor,
  UnknownEditor,
}

const getEditorByName = ({
  type = 'default',
  tab,
  content,
  path,
  size
}) => {
  if (type === 'default') {
    return React.createElement(editors.CodeEditor, { editor: tab.editor })
  } else if (type === 'editorWithPreview') {
    return React.createElement(editors.MarkdownEditor, { editor: tab && tab.editor })
  } else if (type === 'imageEditor') {
    return React.createElement(editors.ImageEditor, { path })  // @fixme: path is wrapped in tab.editor in the new api
  }
  return React.createElement(editors.UnknownEditor, { path, size })
}

const EditorWrapper = ({ tab }, { i18n }) => {
  const title = tab.title
  const { content = '', editor } = tab
  return getEditorByName({
    type: editor.editorType,
    tab,
    content,
    path: editor.file.path,
    size: editor.file.size
  })
}

EditorWrapper.propTypes = {
  name: PropTypes.string,
  tab: PropTypes.object
}

getEditorByName.propTypes = {
  type: PropTypes.string,
  tab: PropTypes.object,
  content: PropTypes.string,
  path: PropTypes.string,
  size: PropTypes.number
}

EditorWrapper.contextTypes = {
  i18n: React.PropTypes.func
}

export default EditorWrapper
