/* @flow weak */
import ace from 'brace';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import ReactAce from './ReactAce';
import * as EditorActions from './actions';
import * as TabActions from '../Tab/actions';
import getMode from './getAceMode';

import 'brace/mode/java';
import 'brace/theme/github';
import 'brace/mode/javascript';
import 'brace/theme/monokai';

class AceEditorWithDefaultConfigs extends Component {
  static defaultProps = {
    theme: 'monokai',
    height: '100%',
    width: '100%',
  };

  constructor(props) {
    super(props);
    this.state = {};
    this.state.name = _.uniqueId('ide_editor_');
  }

  componentWillMount() {

  }

  render() {
    return (
      <ReactAce {...this.props} name={this.state.name} />
    );
  }
}

class AceEditor extends Component {
  static defaultProps = {
    theme: 'monokai',
    height: '100%',
    width: '100%',
  };

  constructor (props) {
    super(props);
    this.state = {};
    this.state.name = this.props.name || _.uniqueId('ide_editor_');
  }

  componentDidMount () {
    const {theme, mode, tab, dispatch} = this.props;
    var editor = this.editor = ace.edit(this.state.name);
    editor.setTheme(`ace/theme/${theme}`);
    editor.$blockScrolling = Infinity;
    // dispatch(EditorActions.registerEditor(this.state.name, editor, this.editorDOM));
    if (tab.editor) {
      editor.setSession(tab.editor.getSession())
    } else if (tab.content) {
      const {body, path} = tab.content;
      if (body) editor.setValue(body, -1);
      require([`brace/mode/${getMode(path)}`], () =>
        editor.getSession().setMode(`ace/mode/${getMode(path)}`)
      )
    }
    editor.focus();
    tab.editor = editor;
    editor.session.on('change', this.onChange)
    setTimeout( () => editor.resize(), 0)

    editor.on('focus', () => {
      this.props.dispatch(TabActions.activateTab(tab.id))
    })
  }

  render () {
    const { width, height } = this.props;
    const name = this.state.name;
    const divStyle = { width, height };
    return (
      <div ref={ c => this.editorDOM = c }
        id={name}
        style={divStyle}
        data-ace-resize='true'
      ></div>
    );
  }

  onChange = (e) => {
    const {tab, dispatch} = this.props;
    if (!tab.flags.modified) {
      dispatch(TabActions.updateTabFlags(tab.id, 'modified', true))
    }
  }
}

AceEditor = connect(null, null)(AceEditor);

export default AceEditor;
