/*@flow weak*/
import React, {Component} from 'react';
import CodeMirror from 'codemirror';
import CodeMirrorModeMeta from 'codemirror/mode/meta.js';
import CodeMirrorLoadMode from 'codemirror/addon/mode/loadmode.js';
import {} from 'codemirror/addon/hint/show-hint.js';
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
    const {theme, tab, width, height} = this.props;
    const editor = this.editor = CodeMirror(this.editorDOM, {
      theme: theme,
      autofocus: true
    });
    if (tab.content) {
      const {body, path} = tab.content;
      const modeInfo = this.getMode(path);
      if (body) editor.setValue(body);
      editor.setSize(width, height);
      if (modeInfo) {
        let mode = modeInfo.mode;
        require([`codemirror/mode/${mode}/${mode}.js`], () => {
          editor.setOption('mode', mode);
        });
      }
    }
    editor.focus();
    // little hack to make codemirror work with legacy interface
    editor.isFocused = editor.hasFocus;
    tab.editor = editor;
    editor.on('change', this.onChange);
    editor.on('focus', () => {
      this.props.dispatch(TabActions.activateTab(tab.id))
    })
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

CodeMirrorEditor = connect(state => ({setting: state.SettingState.views.tabs.EDITOR}), null)(CodeMirrorEditor);

export default CodeMirrorEditor;
