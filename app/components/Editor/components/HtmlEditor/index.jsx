import React, { Component, PropTypes } from 'react'
import cx from 'classnames'
import { observer } from 'mobx-react'
import CodeEditor from '../CodeEditor'
import state from './state'
import * as actions from './actions'
import config from '../../../../config'
import htmlMixin from './htmlMixin'

CodeEditor.use(htmlMixin)

const PreviewEditor = observer(({ url }) => {
  return (
    <div className='preview-iframe'>
      <iframe src={url} />
      {state.isResizing && <div className='preview-iframe-msk'></div> }
    </div>
  )
})

const startResize = (sectionId, e, actions) => {
  if (e.button !== 0) return // do nothing unless left button pressed
      e.preventDefault()
      state.isResizing = true
      let oX = e.pageX // origin x-distince
      let oY = e.pageY // origin y-distince
      const handleResize = (e) => {
        // get destination of difference of two distince x
        const dX = oX - e.pageX
        // get destination of difference of two distince y
        let dY = oY - e.pageY
        oX = e.pageX // reset x
        oY = e.pageY // reset y
        actions.editorResize(sectionId, dX, dY)
      }

  const stopResize = () => {
    window.document.removeEventListener('mousemove', handleResize)
    window.document.removeEventListener('mouseup', stopResize)
    state.isResizing = false
  }
  window.document.addEventListener('mousemove', handleResize)
  window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ parentFlexDirection, sectionId, startResize, actions }) => {
  let barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)} style={{ position: 'relative' }}
      onMouseDown={e => startResize(sectionId, e, actions)}
    />)
}

@observer
class HtmlEditor extends Component {
  render () {
    const { leftGrow, rightGrow, showBigSize, showPreview, previewUniqueId } = state
    const { editor } = this.props

    return (<div
      name='markdown_editor_container'
      style={{
        display: 'flex',
        width: '100%',
        height: '100%'
      }}
    >
      <div name='toolbal_commands' style={{
        position: 'absolute',
        top: '10px',
        right: '20px',
        zIndex: '3'
      }}
      >
        {(showPreview && !showBigSize) ? (<i className='fa fa-expand' style={{ color: '#999' }}
          onClick={actions.togglePreviewSize}
        ></i>) : ((showPreview) ? (
             <i className='fa fa-compress' style={{ color: '#999' }} onClick={actions.togglePreviewSize} />
           ) : null)
        }
        {!showPreview ? <i className='fa fa-eye' style={{ marginLeft: '10px', color: '#999' }} onClick={actions.togglePreview} /> :
        <i className='fa fa-eye-slash' style={{ marginLeft: '10px', color: '#999' }}onClick={actions.togglePreview} />
      }
      </div>
      <div name='body'
        style={{
          display: 'flex',
          width: '100%',
          height: '100%'
        }}
      >
        {
        (!showBigSize || (showBigSize && !showPreview)) ? (
          <div
        name='editor'
        id='editor_preview_markdown_editor'
        style={{
          flexGrow: leftGrow,
          flexShrink: 0,
          flexBasis: 0,
        }}
      >
        {React.createElement(CodeEditor, { editor })}
      </div>) : null
    }
        { (showPreview && !showBigSize) ? (
        <ResizeBar
            sectionId={'editor_preview_markdown'}
            parentFlexDirection={'row'}
            startResize={startResize}
            actions={actions}
          />) : null
      }
        {
        showPreview ? (
          <div
            className='htmlPreview'
            name='preview'
            id='editor_html_preview'
            style={{
              flexGrow: rightGrow,
              flexShrink: 0,
              flexBasis: 0,
            }}
          >
            {<PreviewEditor
              url={`${config.previewURL}${editor.file.path}?r=${previewUniqueId}`}
            />}
          </div>) : null
      }
      </div>
    </div>
    )
  }
}

HtmlEditor.PropTypes = {
  tab: PropTypes.object,
}

export default HtmlEditor
