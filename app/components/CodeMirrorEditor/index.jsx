/*@flow weak*/
import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import {connect} from 'react-redux';
import './addons';
import dispatchCommand from '../../commands/dispatchCommand'
import _ from 'lodash'
import * as TabActions from 'commons/Tab/actions';

function initializeEditor (editorDOM, theme) {
  // @todo: add other setting item from config
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

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { themeSetting, tab } = this.props;
    const themeConfig = themeSetting.items[1].value
    // todo add other setting item from config
    const editor = this.editor = initializeEditor(this.editorDOM, themeConfig)

    // @fixme:
    // related counterparts:
    // 1. IdeEnvironment.js
    // 2. commandBindings/file.js
    window.ide.editors[tab.id] = editor

    if (tab.path && tab.content) {
      const body = tab.content.body;
      const modeInfo = this.getMode(tab);
      if (body) editor.setValue(body);
      if (modeInfo) {
        let mode = modeInfo.mode;
        if (mode === 'null') {
          editor.setOption('mode', mode)
        } else {
          require([`codemirror/mode/${mode}/${mode}.js`], () => editor.setOption('mode', mode));
        }
      }
    }

    editor.focus();
    editor.on('change', this.onChange);
    editor.on('focus', () => this.props.dispatch(TabActions.activateTab(tab.id)))
  }

  // Ref: codemirror/mode/meta.js
  getMode (tab) {
    return CodeMirror.findModeByMIME(tab.contentType) || CodeMirror.findModeByFileName(tab.path.split('/').pop())
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
  };

  componentWillReceiveProps ({ tab, themeSetting }) {
    if (tab.flags.modified || !this.editor || !tab.content) return
    if (tab.content.body !== this.editor.getValue()) {
      this.editor.setValue(tab.content.body)
    }

    const nextTheme = themeSetting.items[1].value
    const theme = this.props.themeSetting.items[1].value
    if (theme !== nextTheme) this.editor.setOption('theme', nextTheme)
  }

  render() {
    const {width, height} = this.props;
    const name = this.state.name;
    const divStyle = {width, height};
    return (
      <div ref={ c => this.editorDOM = c }
        id={name}
        style={divStyle}
      />
    );
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

    const editor = this.editor = initializeEditor(this.editorDOM, theme)
    editor.focus()
    editor.on('change', this.onChange)
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
      <div ref={ c => this.editorDOM = c } style={{ height: '100%', width: '100%' }} />
    )
  }
}

export default CodeMirrorEditor
export { TablessCodeMirrorEditor }
