import React, { PropTypes } from 'react';
import AceEditor from '../AceEditor';
import { markdown } from 'markdown';
import { connect } from 'react-redux';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import * as ResizeActions from './actions';
import MarkdownEditor from '../MarkdownEditor';


const editors = {
  AceEditor,
  MarkdownEditor,
};


const getEditorByName = ({
  type = 'default', 
  tab, 
  body, 
}) => {
  if (type === 'default') {
    return React.createElement(editors.AceEditor, { tab });
  } else if(type === 'editorWithPreview') {
    return React.createElement(editors.MarkdownEditor, { content: body, tab });
  }
};


const EditorWrapper = ({
  tab,
  actions
}) => {
  const { 
    title, 
    content: { body = '' } = {},
  } = tab;
  let type = 'default';
  if (title.endsWith('.md')) {
    type = 'editorWithPreview'
  }
  return getEditorByName({
    type,
    tab,
    body,
  });
};

EditorWrapper.PropTypes = {
  name: PropTypes.string,
  tab: PropTypes.object,
}

export default EditorWrapper;

// export default connect(
//   mapStateToProps,
//   dispatch => ({
//     actions: bindActionCreators(ResizeActions, dispatch)
//   })
// )(EditorWrapper)