import React, { PropTypes } from 'react'
import MarkdownEditor from '../MarkdownEditor'
import PictureEditor from '../PictureEditor'
import CodeMirrorEditor from '../CodeMirrorEditor'

const editors = {
  CodeMirrorEditor,
  MarkdownEditor,
  PictureEditor
}

const getEditorByName = ({
  type = 'default',
  tab,
  body,
  path
}) => {
  if (type === 'default') {
    return React.createElement(editors.CodeMirrorEditor, { tab });
  } else if (type === 'editorWithPreview') {
    return React.createElement(editors.MarkdownEditor, { content: body, tab })
  } else if (type === 'pictureEditor') {
    return React.createElement(editors.PictureEditor, { path })
  }
}

const typeDetect = (title, types) => {
  // title is the filename
  // typeArray is the suffix
  if (!Array.isArray(types)) return title.endsWith(`.${types}`)
  return types.reduce((p, v) => p || title.endsWith(`.${v}`), false)
}

const EditorWrapper = ({ tab }, { i18n }) => {
  const title = tab.title
  const { body = '', path = '' } = tab.content ? tab.content : {}
  let type = 'default'
  if (typeDetect(title, 'md')) {
    type = 'editorWithPreview'
  }
  if (typeDetect(title, ['png', 'jpg', 'jpeg', 'gif'])) {
    type = 'pictureEditor'
  }
  return getEditorByName({
    type,
    tab,
    body,
    path
  })
}

EditorWrapper.propTypes = {
  name: PropTypes.string,
  tab: PropTypes.object
}

getEditorByName.propTypes = {
  type: PropTypes.string,
  tab: PropTypes.object,
  body: PropTypes.object,
  path: PropTypes.string
}

EditorWrapper.contextTypes = {
  i18n: React.PropTypes.func
}

export default EditorWrapper
