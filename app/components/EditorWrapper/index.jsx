import React, { PropTypes } from 'react';
import AceEditor from '../AceEditor';
import MarkdownEditor from '../MarkdownEditor';
import PictureEditor from '../PictureEditor';



const editors = {
  AceEditor,
  MarkdownEditor,
  PictureEditor,
};


const getEditorByName = ({
  type = 'default',
  tab,
  body,
  path
}) => {
  if (type === 'default') {
    return React.createElement(editors.AceEditor, { tab });
  } else if (type === 'editorWithPreview') {
    return React.createElement(editors.MarkdownEditor, { content: body, tab });
  } else if (type === 'pictureEditor') {
    return React.createElement(editors.PictureEditor, { path });
  }
};

const typeDetect = (title, types) => {
  // title is the filename
  // typeArray is the suffix
  if (!Array.isArray(types)) return title.endsWith(`.${types}`);
  return types.reduce((p, v) => p || title.endsWith(`.${v}`), false);
};


const EditorWrapper = ({
  tab,
}) => {
  const {
    title,
    content: { body = '', path = '' } = {},
  } = tab;
  let type = 'default';
  if (typeDetect(title, 'md')) {
    type = 'editorWithPreview';
  }
  if (typeDetect(title, ['png', 'jpg', 'jpeg', 'gif'])) {
    type = 'pictureEditor';
  }
  return getEditorByName({
    type,
    tab,
    body,
    path
  });
};

EditorWrapper.propTypes = {
  name: PropTypes.string,
  tab: PropTypes.object,
};

getEditorByName.propTypes = {
  type: PropTypes.string,
  tab: PropTypes.object,
  body: PropTypes.object,
  path: PropTypes.string,
};


export default EditorWrapper;
