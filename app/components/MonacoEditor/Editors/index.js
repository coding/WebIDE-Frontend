import React from 'react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import config from 'config'
import CodeEditor from './CodeEditor'
import HtmlEditor from './HtmlEditor'
import MarkDownEditor from './MarkDownEditor'
import UnknownEditor from 'components/Editor/components/UnknownEditor'
import ImageEditor from 'components/Editor/components/ImageEditor'
import pluginStore from '../../Plugins/store'

const editorSet = [
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

function matchEditorByContentType(editorType, contentType) {
  for (let i = 0, n = editorSet.length; i < n; i++) {
    const set = editorSet[i];
    if (set.editorType) {
      if (set.editorType === editorType) {
        return set.editor;
      }
    } else if (set.mime) {
      if (set.mime.includes(contentType)) {
        return set.editor;
      }
    }
  }
  return UnknownEditor;
}
// 编辑器插件数组
let pluginArray = [];

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
  // 编辑器插件
  if (!pluginArray.length) {
    pluginArray = pluginStore.plugins.values().filter(plugin => plugin.label.mime);
    for (let i = 0, n = pluginArray.length; i < n; i++) {
      const plugin = pluginArray[i];
      editorSet.unshift({
        mime: plugin.label.mime,
        editor: plugin.app,
      });
    }
  }
  // key is crutial here, it decides whether the component should re-construct
  // or keep using the existing instance.
  const key = `editor_${file.path}`;
  const editorElement = matchEditorByContentType(editor.editorType, editor.contentType);
  return React.createElement(editorElement, { editor, editorInfo, key, tab, active, language: config.mainLanguage, path: file.path, size: file.size });
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
