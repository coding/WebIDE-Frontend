import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import config from 'config'
import CodeEditor from './CodeEditor'
import HtmlEditor from './HtmlEditor'
import MarkDownEditor from './MarkDownEditor'
import UnknownEditor from 'components/Editor/components/UnknownEditor'
import ImageEditor from 'components/Editor/components/ImageEditor'

export const editorSet = [
  {
    editorType: 'htmlEditor',
    editor: HtmlEditor,
  },
  {
    editorType: 'markdownEditor',
    editor: MarkDownEditor,
  },
  {
    editorType: 'imageEditor',
    editor: ImageEditor,
  },
  {
    editorType: 'textEditor',
    editor: CodeEditor,
  },
  {
    editorType: 'unknownEditor',
    editor: UnknownEditor,
  },
];

// 插件形式的编辑器视图会 unshift 到 editorSet 中
function matchEditorByContentType(editorType, contentType, extension) {
  for (let i = 0, n = editorSet.length; i < n; i++) {
    const set = editorSet[i];
    if (set.editorType) {
      if (set.editorType === editorType) {
        return set.editor;
      }
    } else if (set.contentTypes && Array.isArray(set.contentTypes)) {
      // 通过 contentTypes 拦截。优先级更高
      if (set.contentTypes.includes(contentType)) {
        return set.editor;
      }
    } else if (set.extensions && Array.isArray(set.extensions)) {
      // 通过 extensions 拦截。优先级更低
      if (set.extensions.includes(extension)) {
        return set.editor;
      }
    }
  }
  return UnknownEditor;
}

const EditorWrapper = observer(({ tab, active }) => {
  // loading
  if (tab.file && tab.file.isEditorLoading) {
    return (
      <div className="editor-spinner">
        <i className="fa fa-spinner fa-pulse"></i>
      </div>
    )
  }
  const { editor, editorInfo } = tab;
  const file = editor.file || {};
  // key is crutial here, it decides whether the component should re-construct
  // or keep using the existing instance.
  const key = `editor_${file.path}`;
  const editorElement = matchEditorByContentType(editor.editorType, editor.contentType, editor.filePath.split('.').pop());
  return React.createElement(editorElement, { editorInfo, key, tab, active, language: config.mainLanguage, path: file.path, size: file.size });
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
