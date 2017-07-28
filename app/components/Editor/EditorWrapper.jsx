import React, { PropTypes } from 'react'
import CodeEditor from './components/CodeEditor'
import MarkdownEditor from './components/MarkdownEditor'
import ImageEditor from './components/ImageEditor'
import UnknownEditor from './components/UnknownEditor'
import WelcomeEditor from './components/WelcomeEditor'
import { getTabType } from 'utils'

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
    return React.createElement(editors.MarkdownEditor, { content, tab })
  } else if (type === 'imageEditor') {
    return React.createElement(editors.ImageEditor, { path })  // @fixme: path is wrapped in tab.editor in the new api
  }
  return React.createElement(editors.UnknownEditor, { path, size })
}

const typeDetect = (title, types) => {
  // title is the filename
  // typeArray is the suffix
  if (!Array.isArray(types)) return title.endsWith(`.${types}`)
  return types.reduce((p, v) => p || title.endsWith(`.${v}`), false)
}

const EditorWrapper = ({ tab }, { i18n }) => {
  const title = tab.title
  const { path = '', content = '' } = tab
  let type = 'default'
  if (tab.contentType) {
    if (getTabType(tab) === 'IMAGE') {
      type = 'imageEditor'
    } else if (getTabType(tab) === 'UNKNOWN') {
      type = 'unknownEditor'
    }
  }
  if (typeDetect(title, 'md')) {
    type = 'editorWithPreview'
  }
  if (typeDetect(title, ['png', 'jpg', 'jpeg', 'gif'])) {
    type = 'imageEditor'
  }
  return getEditorByName({
    type,
    tab,
    content,
    path,
    size: tab.size
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
