import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { autorun, extendObservable, observable, autorunAsync } from 'mobx'
import debounce from 'lodash/debounce'
import cx from 'classnames'
import marked from 'marked'
import Remarkable from 'remarkable'
import { observer } from 'mobx-react'
import CodeEditor from './CodeEditor'
import state from './state'
import * as actions from './actions'
// import mdMixin from './mdMixin'

// CodeEditor.use(mdMixin)

const md = new Remarkable('full', {
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />)
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks
  linkify:      true,         // autoconvert URL-like texts to links
  linkTarget:   '',           // set target to open link in

  // Enable some language-neutral replacements + quotes beautification
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if input not changed
  highlight: (str, lang) => {
    require('highlight.js/styles/github-gist.css')
    const hljs = require('highlight.js')
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value
      } catch (__) {}
    }

    try {
      return hljs.highlightAuto(str).value
    } catch (__) {}

    return '' // use external default escaping
  }
})

md.renderer.rules.table_open = () => {
  return '<table class="table table-striped">\n'
}

md.renderer.rules.paragraph_open = (tokens, idx) => {
  let line
  if (tokens[idx].lines && tokens[idx].level === 0) {
    line = tokens[idx].lines[0]
    return '<p class="line" data-line="' + line + '">'
  }
  return '<p>'
}

md.renderer.rules.heading_open = (tokens, idx) => {
  let line
  if (tokens[idx].lines && tokens[idx].level === 0) {
    line = tokens[idx].lines[0]
    return '<h' + tokens[idx].hLevel + ' class="line" data-line="' + line + '">'
  }
  return '<h' + tokens[idx].hLevel + '>'
}

marked.setOptions({
  highlight: (code) => {
    require('highlight.js/styles/github-gist.css')
    return require('highlight.js').highlightAuto(code).value
  },
})

@observer
class PreviewEditor extends Component {
  constructor (props) {
    super(props)
  }

  makeHTMLComponent (html) {
    return React.DOM.div({ dangerouslySetInnerHTML: { __html: html } })
  }

  render () {
    const { content, editor } = this.props
    return (
      <div name='markdown_preview' className='markdown content' ref={(dom) => {
        this.previewDOM = dom
        editor.previewDOM = dom
      }}>
        { this.makeHTMLComponent(md.render(content)) }
      </div>
    )
  }
}

const startResize = (sectionId, e, actions, state) => {
  if (e.button !== 0) return // do nothing unless left button pressed
      e.preventDefault()
      let oX = e.pageX // origin x-distince
      let oY = e.pageY // origin y-distince
      const handleResize = (e) => {
        // get destination of difference of two distince x
        const dX = oX - e.pageX
        // get destination of difference of two distince y
        let dY = oY - e.pageY
        oX = e.pageX // reset x
        oY = e.pageY // reset y
        actions.editorResize(sectionId, dX, dY, state)
      }

  const stopResize = () => {
    window.document.removeEventListener('mousemove', handleResize)
    window.document.removeEventListener('mouseup', stopResize)
  }
  window.document.addEventListener('mousemove', handleResize)
  window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ parentFlexDirection, sectionId, startResize, actions, state }) => {
  let barClass = (parentFlexDirection == 'row') ? 'col-resize' : 'row-resize'
  return (
    <div className={cx('resize-bar', barClass)} style={{ position: 'relative' }}
      onMouseDown={e => startResize(sectionId, e, actions, state)}
    />)
}

@observer
class MarkdownEditor extends Component {
  constructor (props) {
    super(props)
    if (!props.tab.leftGrow) {
      extendObservable(props.tab, {
        leftGrow: 50,
        rightGrow: 50,
        showBigSize: false,
        showPreview: true,
      })
    }
    
    this.state = observable({
      previewContent: '',
      tokens: []
    })
  }

  componentDidMount () {
    const dispose = autorun(() => {
      this.setPreviewContent(this.props.editorInfo.file.content)
    })
  }

  setPreviewContent = debounce((content) => {
    this.state.previewContent = content
  }, 500)

  render () {
    const { editor, tab, active, editorInfo } = this.props
    const { leftGrow, rightGrow, showBigSize, showPreview } = tab

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
          onClick={() => actions.togglePreviewSize({ state: tab })}
        ></i>) : ((showPreview) ? (
             <i className='fa fa-compress' style={{ color: '#999' }} onClick={() => actions.togglePreviewSize({ state: tab })} />
           ) : null)
        }
        {!showPreview ? <i className='fa fa-eye' style={{ marginLeft: '10px', color: '#999' }} onClick={() => actions.togglePreview({ state: tab })} /> :
        <i className='fa fa-eye-slash' style={{ marginLeft: '10px', color: '#999' }} onClick={() => actions.togglePreview({ state: tab })} />
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
        {React.createElement(CodeEditor, { editor, editorInfo })}
      </div>) : null
    }
        { (showPreview && !showBigSize) ? (
        <ResizeBar
            sectionId={'editor_preview_markdown'}
            parentFlexDirection={'row'}
            startResize={startResize}
            actions={actions}
            state={tab}
          />) : null
      }
        {
        showPreview ? (
          <div
          name='preview'
          id='editor_preview_preview'
          style={{
            flexGrow: rightGrow,
            flexShrink: 0,
            flexBasis: 0,
          }}
        >
          <PreviewEditor content={this.state.previewContent} editor={editor} />
        </div>) : null
      }
      </div>
    </div>
    )

  }
}

MarkdownEditor.PropTypes = {
  tab: PropTypes.object,
  content: PropTypes.string,
}

export default MarkdownEditor
