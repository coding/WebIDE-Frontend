/* @flow weak */
// Hence the naming: http://askubuntu.com/questions/111144/are-terminal-and-shell-the-same
import React, { Component, PropTypes } from 'react';
import Terminal from 'sh.js';
import _ from 'lodash';
import { connect } from 'react-redux';

import terms from './terminal-client';
import * as TabActions from '../Tab/actions';

class Term extends Component {
  static contextTypes = {
    onResizing: PropTypes.func
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    var _this = this;
    var terminal = this.terminal = new Terminal({
      theme: 'terminal_basic',
      cols: 80,
      rows:24
    });

    terminal.tabId = this.props.tab.id;
    terminal.open(this.termDOM);
    terminal.name = this.sessionId = _.uniqueId('term_');

    terminal.on('resize', (cols, rows) => {
      terms.resize(terminal, cols, rows);
    });
    terminal.sizeToFit();
    terms.add(terminal);
    terminal.on('data', data => {
      terms.getSocket().emit('term.input', {id: terminal.name, input: data})
    });
    terminal.on('title', _.debounce(title => {
      _this.props.handleTabTitle(_this.props.tab.id, title) // change tab title.
    }, 300));

    this.context.onResizing( ()=>{terminal.sizeToFit()} );

    // this.setTheme
  }

  render() {
    const {tab} = this.props;
    return (
      <div className='ide-terminal'>
        <div className='terminal-container'>
          <div className='terminal-body' ref={r=>this.termDOM=r}></div>
        </div>
      </div>
    );
  }

  setTheme(themeName) {
    var theme = Terminal.themes.defaults['default'];
    var terminal = this.terminal;
    terminal.colors = Terminal.themes.colors(theme);

    if (themeName == 'terminal_basic') terminal.colors[256] = '#fffff7';
    terminal.element.style.backgroundColor = terminal.colors[256];
    terminal.element.style.color = terminal.colors[257];
    terminal.refresh(0, terminal.rows - 1)
  }
}


Term = connect(null, dispatch => {
  return {
    handleTabTitle: (id, title) => dispatch(TabActions.updateTab({title, id}))
  }
})(Term)

export default Term;
