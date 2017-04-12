/* @flow weak */
// Hence the naming: http://askubuntu.com/questions/111144/are-terminal-and-shell-the-same
import React, { Component, PropTypes } from 'react';
import Terminal from 'sh.js';
import _ from 'lodash';
import { emitter, E } from 'utils'

import terms from './terminal-client';
import * as TabActions from 'commons/Tab/actions';
terms.setActions(TabActions);

class Term extends Component {
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
    setTimeout(() => terminal.sizeToFit(), 0)
    emitter.on(E.PANEL_RESIZED, this.onResize.bind(this))

    terms.add(terminal);
    terminal.on('data', data => {
      terms.getSocket().emit('term.input', {id: terminal.name, input: data})
    });
    terminal.on('title', _.debounce(title => {
      _this.props.tab.title = title
    }, 300));
  }

  componentWillUnmount() {
    emitter.removeListener(E.PANEL_RESIZED, this.onResize)
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

  onResize () {
    this.terminal.sizeToFit()
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

export default Term;
