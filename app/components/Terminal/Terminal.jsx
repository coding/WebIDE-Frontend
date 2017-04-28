/* @flow weak */
// Hence the naming: http://askubuntu.com/questions/111144/are-terminal-and-shell-the-same
import React, { Component, PropTypes } from 'react';
import Terminal from 'sh.js';
import _ from 'lodash';
import { emitter, E } from 'utils'

import TerminalManager from './terminal-client';
import * as TabActions from 'commons/Tab/actions';


class Term extends Component {
  constructor(props) {
    super(props);
    this.setTheme = this.setTheme.bind(this)
  }

  componentDidMount() {
    var _this = this;
    var terminalManager = new TerminalManager()
    var terminal = this.terminal = new Terminal({
      theme: 'terminal_basic',
      cols: 80,
      rows:24
    });

    terminalManager.setActions(TabActions);

    terminal.tabId = this.props.tab.id;
    terminal.open(this.termDOM);
    terminal.id = this.sessionId = _.uniqueId('term_');

    terminal.on('resize', (cols, rows) => {
      terminalManager.resize(terminal, cols, rows);
    });
    setTimeout(() => terminal.sizeToFit(), 0)
    emitter.on(E.PANEL_RESIZED, this.onResize.bind(this))
    emitter.on(E.THEME_CHANGED, this.onTheme.bind(this))

    terminalManager.add(terminal);
    terminal.on('data', data => {
      terminalManager.getSocket().emit('term.input', {id: terminal.id, input: data})
    });
    terminal.on('title', _.debounce(title => {
      _this.props.tab.title = title
    }, 300));
  }

  componentWillUnmount() {
    emitter.removeListener(E.PANEL_RESIZED, this.onResize)
    emitter.removeListener(E.THEME_CHANGED, this.onTheme)
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

  onTheme (nextThemeId) {
    let themeName = 'terminal_basic'
    if (nextThemeId === 'dark') {
      themeName = 'default'
    }
    this.setTheme(themeName)
  }

  setTheme(themeName) {
    var theme = Terminal.themes.defaults[themeName];
    var terminal = this.terminal;
    terminal.colors = Terminal.themes.colors(theme);

    // if (themeName == 'terminal_basic') terminal.colors[256] = '#fffff7';
    terminal.element.style.backgroundColor = terminal.colors[256];
    terminal.element.style.color = terminal.colors[257];
    terminal.refresh(0, terminal.rows - 1)
  }
}

export default Term;
