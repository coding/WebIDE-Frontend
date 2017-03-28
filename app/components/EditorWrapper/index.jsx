import React, { PropTypes } from 'react'
import MarkdownEditor from '../MarkdownEditor'
import ImageEditor from '../ImageEditor'
import CodeMirrorEditor from '../CodeMirrorEditor'
import UnknownEditor from '../UnknownEditor'
import * as Tab from '../Tab'

const editors = {
  CodeMirrorEditor,
  MarkdownEditor,
  ImageEditor,
  UnknownEditor,
}

const getEditorByName = ({
  type = 'default',
  tab,
  body,
  path,
  size
}) => {
  if (type === 'default') {
    return React.createElement(editors.CodeMirrorEditor, { tab });
  } else if (type === 'editorWithPreview') {
    return React.createElement(editors.MarkdownEditor, { content: body, tab })
  } else if (type === 'imageEditor') {
    return React.createElement(editors.ImageEditor, { path })
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
  const { body = '' } = tab.content ? tab.content : {}
  const { path = '' } = tab
  let type = 'default'
  if (tab.contentType) {
    if (Tab.types.getTabType(tab) === 'IMAGE') {
      type = 'imageEditor'
    } else if (Tab.types.getTabType(tab) === 'UNKNOWN') {
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
    body,
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
  body: PropTypes.object,
  path: PropTypes.string,
  size: PropTypes.number
}

EditorWrapper.contextTypes = {
  i18n: React.PropTypes.func
}

export default EditorWrapper
