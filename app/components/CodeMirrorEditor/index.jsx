/*@flow weak*/
import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import {connect} from 'react-redux';
import './addons';
import { dispatchCommand } from '../../commands'
import _ from 'lodash'
import * as TabActions from '../Tab/actions';

const debounced = _.debounce(func => func(), 1000)
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
    const {themeSetting, tab, width, height} = this.props;
    const themeConfig = themeSetting.items[1].value.split('/').pop();
    // todo add other setting item from config
    const editor = this.editor = CodeMirror(this.editorDOM, {
      theme: themeConfig,
      autofocus: true,
      lineNumbers: true,
      matchBrackets: true,
      autoCloseBrackets: true,
    });
    // @fixme:
    // related counterparts:
    // 1. IdeEnvironment.js
    // 2. commandBindings/file.js
    window.ide.editors[tab.id] = editor

    // 1. resize
    editor.setSize(width, height);

    // 2. prevent default codemirror dragover handler, so the drag-to-split feature can work
    //    but the default handler that open a file on drop is actually pretty neat,
    //    should make our drag feature compatible with it later
    editor.on('dragover', e => e.preventDefault())

    if (tab.content) {
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
    editor.isFocused = editor.hasFocus; // little hack to make codemirror work with legacy interface
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

  componentWillReceiveProps ({ tab }) {
    if (tab.flags.modified || !this.editor || !tab.content) return
    if (tab.content.body !== this.editor.getValue()) {
      this.editor.setValue(tab.content.body)
    }
  }

  render() {
    const {width, height} = this.props;
    const name = this.state.name;
    const divStyle = {width, height};
    return (
      <div ref={ c => this.editorDOM = c }
           id={name}
           style={divStyle}
      ></div>
    );
  }

}

CodeMirrorEditor = connect(state => ({
  setting: state.SettingState.views.tabs.EDITOR,
  themeSetting: state.SettingState.views.tabs.THEME,
})
)(CodeMirrorEditor);

export default CodeMirrorEditor;
