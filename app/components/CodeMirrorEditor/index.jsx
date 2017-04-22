/*@flow weak*/
import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import {connect} from 'react-redux';
import './addons';
import dispatchCommand from '../../commands/dispatchCommand'
import _ from 'lodash'
import * as TabActions from 'commons/Tab/actions';

function initializeEditor (editorContainer, theme) {
  // @todo: add other setting item from config
  const editorDOM = document.createElement('div')
  Object.assign(editorDOM.style, { width: '100%', height: '100%' })
  editorContainer.appendChild(editorDOM)
  const editor = CodeMirror(editorDOM, {
    theme,
    autofocus: true,
    lineNumbers: true,
    matchBrackets: true,
    autoCloseBrackets: true,
  })

  // 1. resize
  editor.setSize('100%', '100%')

  // 2. prevent default codemirror dragover handler, so the drag-to-split feature can work
  //    but the default handler that open a file on drop is actually pretty neat,
  //    should make our drag feature compatible with it later
  editor.on('dragover', (a, e) => e.preventDefault())

  editor.isFocused = editor.hasFocus // little hack to make codemirror work with legacy interface
  return editor
}

// Ref: codemirror/mode/meta.js
function getMode (tab) {
  return CodeMirror.findModeByMIME(tab.contentType) || CodeMirror.findModeByFileName(tab.path.split('/').pop())
}

const debounced = _.debounce(func => func(), 1000)

@connect(state => ({
  setting: state.SettingState.views.tabs.EDITOR,
  themeSetting: state.SettingState.views.tabs.THEME,
}))
class CodeMirrorEditor extends Component {
  static defaultProps = {
    theme: 'default',
    height: '100%',
    width: '100%',
  };

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { themeSetting, tab } = this.props;
    const themeConfig = themeSetting.items[1].value
    let editorInitialized = false
    // todo add other setting item from config
    if (tab.editor) {
      this.editor = tab.editor
      this.editorContainer.appendChild(this.editor.getWrapperElement())
    } else {
      this.editor = tab.editor = initializeEditor(this.editorContainer, themeConfig)
      editorInitialized = true
    }
    const editor = this.editor
    // @fixme:
    // related counterparts:
    // 1. IdeEnvironment.js
    // 2. commandBindings/file.js
    window.ide.editors[tab.id] = editor

    if (editorInitialized && tab.path && tab.content) {
      const body = tab.content.body
      const modeInfo = getMode(tab)
      if (body) editor.setValue(body)
      if (modeInfo) {
        let mode = modeInfo.mode
        if (mode === 'null') {
          editor.setOption('mode', mode)
        } else {
          require([`codemirror/mode/${mode}/${mode}.js`], () => editor.setOption('mode', mode))
        }
      }
    }

    editor.focus()
    editor.on('change', this.onChange)
    editor.on('focus', this.onFocus)
  }

  componentWillUnmount () {
    this.editor.off('change', this.onChange)
    this.editor.off('focus', this.onFocus)
  }

  onChange = (e) => {
    if (!this.isChanging) this.isChanging = true
    const {tab, dispatch} = this.props;
    dispatch(TabActions.updateTab({
      id: tab.id,
      flags: { modified: true },
      content: { body: this.editor.getValue() }
    }))
    if (tab.path) debounced(() => {
      dispatchCommand('file:save')
      this.isChanging = false
    })
  }

  onFocus = () => {
    this.props.dispatch(TabActions.activateTab(this.props.tab.id))
  }

  componentWillReceiveProps ({ tab, themeSetting }) {
    if (tab.flags.modified || !this.editor || !tab.content) return
    if (tab.content.body !== this.editor.getValue()) {
      this.editor.setValue(tab.content.body)
    }

    const nextTheme = themeSetting.items[1].value
    const theme = this.props.themeSetting.items[1].value
    if (theme !== nextTheme) this.editor.setOption('theme', nextTheme)
  }

  render () {
    const {width, height} = this.props
    const name = this.state.name
    const divStyle = { width, height }
    return (
      <div ref={c => this.editorContainer = c}
        id={name}
        style={divStyle}
      />
    )
  }

}


@connect(state => ({
  setting: state.SettingState.views.tabs.EDITOR,
  themeSetting: state.SettingState.views.tabs.THEME,
}))
class TablessCodeMirrorEditor extends Component {
  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    const { themeSetting, width, height } = this.props
    const theme = themeSetting.items[1].value

    this.editor = initializeEditor(this.editorContainer, theme)
    this.editor.focus()
    this.editor.on('change', this.onChange)
  }

  onChange = (e) => {
    this.props.dispatch(TabActions.createTabInGroup(this.props.tabGroupId, {
      flags: { modified: true },
      content: this.editor.getValue()
    }))
  }

  componentWillReceiveProps ({ themeSetting }) {
    const nextTheme = themeSetting.items[1].value
    const theme = this.props.themeSetting.items[1].value
    if (theme !== nextTheme) this.editor.setOption('theme', nextTheme)
  }

  render () {
    return (
      <div ref={ c => this.editorContainer = c } style={{ height: '100%', width: '100%' }} />
    )
  }
}

export default CodeMirrorEditor
export { TablessCodeMirrorEditor }
