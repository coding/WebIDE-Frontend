import React, { PropTypes } from 'react';
import AceEditor from '../AceEditor';
import { markdown } from 'markdown';
import { connect } from 'react-redux';
import cx from 'classnames';
import { bindActionCreators } from 'redux';
import * as ResizeActions from './actions';


const PreviewEditor = (content) => {
  const makeHTMLComponent = (html) => React.DOM.div({ dangerouslySetInnerHTML: {__html: html} });
  return <div>{ makeHTMLComponent(markdown.toHTML(content)) }</div>;
}


const startResize = (sectionId, e, actions) => {
   if (e.button !== 0) return; // do nothing unless left button pressed
      e.preventDefault();
      let oX = e.pageX; // origin x-distince
      let oY = e.pageY; // origin y-distince
      const handleResize = (e) => {
        // get destination of difference of two distince x
        let dX = oX - e.pageX;
        // get destination of difference of two distince y
        let dY = oY - e.pageY;
        oX = e.pageX; // reset x
        oY = e.pageY; // reset y
        console.log('offset', dX, oX);
        actions.editorResize(sectionId, dX, dY);  
      }

      const stopResize = () => {
        window.document.removeEventListener('mousemove', handleResize);
        window.document.removeEventListener('mouseup', stopResize);
      }
      window.document.addEventListener('mousemove', handleResize);
      window.document.addEventListener('mouseup', stopResize);
}

const ResizeBar = ({ parentFlexDirection, sectionId, startResize, actions }) => {
  var barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)} style={{ position: 'relative' }}
      onMouseDown={e => startResize(sectionId, e, actions)}
    />)
};

const MarkdownEditor = ({
  content,
  leftGrow,
  rightGrow,
  previewFullScreen,
  showPreview,
  tab,
  actions
}) => {
  return (
    <div style={{ 
      display:'flex',
      width: '100%',
      height: '100%'
    }}>
      <div 
      name="editor"
      id="editor_preview_markdown_editor"
      style={{
        flexGrow: leftGrow,
        flexShrink: 0,
        flexBasis: 0,
       }}>
        {React.createElement(AceEditor, { tab })}    
      </div>
      <ResizeBar 
          sectionId={'editor_preview_markdown'}
          parentFlexDirection={'row'}
          startResize={startResize}
          actions={actions} 
      />
      <div 
      name="preview" 
      id="editor_preview_preview"
      style={{
        flexGrow: rightGrow,
        flexShrink: 0,
        flexBasis: 0,        
        backgroundColor: 'white',
      }}>
        {PreviewEditor(content)}
      </div>
    </div>
  ); 
}

MarkdownEditor.PropTypes = {
  name: PropTypes.string,
  tab: PropTypes.object,
  actions: PropTypes.object,
}

const mapStateToProps = (state) => ({
    leftGrow: state.MarkdownEditorState.leftGrow,
    rightGrow: state.MarkdownEditorState.rightGrow,
    previewFullScreen: state.MarkdownEditorState.previewFullScreen,
    showPreview: state.MarkdownEditorState.showPreview,
});

export default connect(
  mapStateToProps,
  dispatch => ({
    actions: bindActionCreators(ResizeActions, dispatch)
  })
)(MarkdownEditor)