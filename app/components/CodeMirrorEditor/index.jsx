/*@flow weak*/
import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import './addons';
import {connect} from 'react-redux';
import * as TabActions from '../Tab/actions';

class CodeMirrorEditor extends Component {
  static defaultProps = {
    theme: 'monokai',
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
      const {body, path} = tab.content;
      const modeInfo = this.getMode(path);
      if (body) editor.setValue(body);
      if (modeInfo) {
        let mode = modeInfo.mode;
        require([`codemirror/mode/${mode}/${mode}.js`], () => {
          editor.setOption('mode', mode);
        });
      }
    }
    editor.focus();
    editor.isFocused = editor.hasFocus; // little hack to make codemirror work with legacy interface
    editor.on('change', this.onChange);
    editor.on('focus', () => this.props.dispatch(TabActions.activateTab(tab.id)))
  }

  getMode(path) {
    const m = /.+\.([^.]+)$/.exec(path);
    if (m) {
      const info = CodeMirror.findModeByExtension(m[1]);
      if (info) {
        return info
      }
    }
  }

  onChange = (e) => {
    const {tab, dispatch} = this.props;
    if (!tab.flags.modified) {
      dispatch(TabActions.updateTabFlags(tab.id, 'modified', true))
    }
  };


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
}),
 null)(CodeMirrorEditor);

export default CodeMirrorEditor;
