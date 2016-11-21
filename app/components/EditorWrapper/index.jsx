import React, { PropTypes } from 'react';
import AceEditor from '../AceEditor';
import { markdown } from 'markdown';


const PreviewEditor = (content) => {
  const makeHTMLComponent = (html) => React.DOM.div({ dangerouslySetInnerHTML: {__html: html} });
  return <div style={{ marginLeft: '10px' }}>{makeHTMLComponent(markdown.toHTML(content))}</div>;
}

const editors = {
  AceEditor,
  PreviewEditor,
};

const getEditorByName = ({ type = 'default', tab, body }) => {
  if (type === 'default') {
    return React.createElement(editors.AceEditor, { tab });
  } else if(type === 'editorWithPreview') {
    return (
    <div style={{ 
      display:'flex',
      width: '100%',
      height: '100%'
    }}>
      <div name="editor" style={{
        flexGrow: 1,
        flexShrink: 0,
        maxWidth: '50%'
       }}>
        {React.createElement(editors.AceEditor, { tab })}    
      </div>
      <div name="preview" style={{
        flexGrow: 1,
        flexShrink: 0,
        maxWidth: '50%',
        backgroundColor: 'white',
      }}>
        {editors.PreviewEditor(body)}
      </div>
    </div>
  );
  }
};


const EditorWrapper = ({
  tab
}) => {
  const { title, content: { body = '' } = {} } = tab;
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
  tab: PropTypes.object
}


export default EditorWrapper;
