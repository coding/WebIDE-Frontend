import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { autorun, extendObservable, observable } from 'mobx'
import debounce from 'lodash/debounce'
import cx from 'classnames'
import Remarkable from 'remarkable'
import { observer } from 'mobx-react'
import CodeEditor from './CodeEditor'
import * as actions from './actions'
import scrollMixin from './scrollMixin';
// import mdMixin from './mdMixin'

// CodeEditor.use(mdMixin)

const eventXSSReg = /\son[a-z]{3,20}=('\S*'|"\S*")/ig;
const hrefXSSReg = /\shref=('javascript:\S+'|"javascript:\S+")/ig;
const scriptLtReg = /<(\/?script)/ig;
const scriptGtReg = /(\/?script)>/ig;

const md = new Remarkable('full', {
  html:         true,        // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />)
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks
  linkify:      true,         // autoconvert URL-like texts to links
  linkTarget:   '_blank',           // set target to open link in

  // Enable some language-neutral replacements + quotes beautification
  typographer:  false,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Set doubles to '«»' for Russian, '„“' for German.
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if input not changed
  highlight: (str, lang) => {
    require('highlight.js/styles/monokai-sublime.css')
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

md.renderer.rules.bullet_list_open = (tokens, idx) => {
  let line
  if (tokens[idx].lines && tokens[idx].level === 0) {
    line = tokens[idx].lines[0]
    return '<ul class="line" data-line="' + line + '">'
  }
  return '<ul>'
}

@observer
class PreviewEditor extends Component {
  constructor (props) {
    super(props)
  }

  makeHTMLComponent (html) {
    return React.DOM.div({ dangerouslySetInnerHTML: { __html: html } })
  }

  render () {
    const { content } = this.props
    const html = md.render(content).replace(eventXSSReg, '').replace(hrefXSSReg, '').replace(scriptLtReg, '&lt;$1').replace(scriptGtReg, '$1&gt;');
    return (
      <div name='markdown_preview' className='markdown content'>
        {this.makeHTMLComponent(html) }
      </div>
    )
  }
}

const startResize = (e, actions, state) => {
  if (e.button !== 0) return // do nothing unless left button pressed
      e.preventDefault()
      let oX = e.pageX // origin x-distince
      let oY = e.pageY // origin y-distince
      const handleResize = (e) => {
        // get destination of difference of two distince x
        const dX = oX - e.pageX
        // get destination of difference of two distince y
        const dY = oY - e.pageY
        oX = e.pageX // reset x
        oY = e.pageY // reset y
        actions.editorResize(dX, state, 'editor_preview_markdown_editor', 'editor_preview_preview')
      }

  const stopResize = () => {
    window.document.removeEventListener('mousemove', handleResize)
    window.document.removeEventListener('mouseup', stopResize)
  }
  window.document.addEventListener('mousemove', handleResize)
  window.document.addEventListener('mouseup', stopResize)
}

const ResizeBar = ({ startResize, actions, state }) => {
  return <div className="resize-bar col-resize" onMouseDown={e => startResize(e, actions, state)}/>
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
      tokens: [],
    })
  }

  componentDidMount() {
    autorun(() => {
      this.setPreviewContent(this.props.editorInfo.file.content)
    })
  }

  componentDidUpdate() {
    if (this.previewDOM) {
      scrollMixin(this.props.editorInfo.monacoEditor, this.previewDOM);
    }
  }

  setPreviewContent = debounce((content) => {
    this.state.previewContent = content
  }, 500)

  render() {
    const { tab, active, editorInfo } = this.props
    const { leftGrow, rightGrow, showBigSize, showPreview } = tab
    const editorStyle = { flexGrow: leftGrow, display: !showBigSize || (showBigSize && !showPreview) ? 'block' : 'none' };
    const previewStyle = { flexGrow: rightGrow };
    const expandIcon = showBigSize ? 'fa fa-compress' : 'fa fa-expand';
    const eyeIcon = showPreview ? 'fa fa-eye-slash' : 'fa fa-eye';
    return (
      <div className="markdown-editor-container">
        <div className="preview-action">
          {showPreview && <i className={expandIcon} onClick={() => actions.togglePreviewSize({ state: tab })}></i>}
          <i className={eyeIcon} onClick={() => actions.togglePreview({ state: tab })}></i>
        </div>
        <div className="wrap">
          <div id='editor_preview_markdown_editor' style={editorStyle}>
            <CodeEditor editorInfo={editorInfo} tab={tab} />
          </div>
          {(showPreview && !showBigSize) && (
            <ResizeBar startResize={startResize} actions={actions} state={tab} />
          )}
          {showPreview && (
            <div id='editor_preview_preview' style={previewStyle} ref={dom => this.previewDOM = dom}>
              <PreviewEditor content={this.state.previewContent} />
            </div>
          )}
        </div>
      </div>
    )

  }
}

MarkdownEditor.propTypes = {
  tab: PropTypes.object,
  content: PropTypes.string,
}

export default MarkdownEditor
