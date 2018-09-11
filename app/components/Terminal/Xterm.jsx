import React, { Component } from 'react'
import { reaction, autorun } from 'mobx'
import PropTypes from 'prop-types'
import { Terminal } from 'xterm'
import * as uuid from 'uuid'
import * as fit from 'xterm/lib/addons/fit/fit'
import 'xterm/dist/xterm.css'
Terminal.applyAddon(fit)

import _ from 'lodash'
import { emitter, E } from 'utils'

import TerminalManager from './terminal-client'
import * as TabActions from 'components/Tab/actions'
import SettingState from 'components/Setting/state'
import TerminalState from './state'

const DARK_THEME = {
  foreground: '#FFF',
  background: '#000',
  cursor: '#FFF',
  cursorAccent: '#000',
  selection: 'rgba(255, 255, 255, 0.3)',
}

const BRIGHT_THEME = {
  foreground: '#000',
  background: '#FFF',
  cursor: '#000',
  cursorAccent: '#FFF',
  selection: 'rgba(0, 0, 0, 0.3)',
}

class Term extends Component {
  constructor (props) {
    super(props)
    this.afterInit = this.props.afterInit;
  }

  componentDidMount () {
    const _this = this
    _this.props.tab.title = 'Shell'
    const terminalManager = new TerminalManager()
    TerminalState.terminalManager = terminalManager
    const uiTheme = SettingState.settings.appearance.ui_theme.value
    let theme = BRIGHT_THEME
    if (uiTheme === 'dark') {
      theme = DARK_THEME
    }

    const terminal = this.terminal = new Terminal({
      fontSize: SettingState.settings.appearance.terminal_font_size.value || 12,
      // theme: themeName,
      cols: 80,
      rows: 24,
      // fontFamily: 'Menlo, Monaco, "DejaVu Sans Mono", Consolas, "Andale Mono", monospace;',
    })
    console.log(terminal)
    autorun(() => {
      const props = this.props;
      // 初始加载时不执行，否则跟编辑器光标冲突
      // afterInit用来判断是否是初始加载
      if (props.tab && props.tab.isActive && this.afterInit) {
        setTimeout(() => terminal.focus(), 0)
      }
      if (!this.afterInit) {
        this.afterInit = true;
      }
    })

    terminal.attachCustomKeyEventHandler((e) => {
      if (e.keyCode === 66 && e.altKey) {
        terminalManager.getSocket().emit('term.input', { id: terminal.id, input: '\u001bb' }) // x1bb
        return false
      } else if (e.keyCode === 70 && e.altKey) {
        terminalManager.getSocket().emit('term.input', { id: terminal.id, input: '\u001bf' }) // x1bf
        return false
      } else if (e.keyCode === 68 && e.altKey) {
        terminalManager.getSocket().emit('term.input', { id: terminal.id, input: '\u001bd' })
        return false
      } else if (e.keyCode === 8 && e.altKey) {
        terminalManager.getSocket().emit('term.input', { id: terminal.id, input: '\x1b' + '\x7f' })
        return false
      }
      if (e.keyCode === 8747 || e.keyCode === 402 || e.keyCode === 8706) {
        return false
      }
      return true
    })

    terminal.setOption('theme', theme)

    const { tab } = this.props
    terminalManager.setActions(TabActions)
    terminal.tabId = tab.id
    tab.terminal = terminal
    terminal.open(this.termDOM)
    terminal.fit()
    console.log(tab)
    terminal.id = this.sessionId = (tab.shared && tab.sharer && tab.termId) ? tab.termId : uuid()
    terminalManager.add(terminal, tab.shared)
    terminal.on('resize', ({ cols, rows }) => {
      terminalManager.resize(terminal, cols, rows)
    })
    emitter.on(E.PANEL_RESIZED, this.onResize.bind(this))
    emitter.on(E.THEME_CHANGED, this.onTheme.bind(this))
    emitter.on(E.TERM_FONTSIZE_CHANGED, val => {
      if (val < 12) val = 12
      terminal.setOption('fontSize', val)
    })

    terminal.on('data', (data) => {
      terminalManager.getSocket().emit('term.input', { id: terminal.id, input: data })
    })
    terminal.on('title', _.debounce((title) => {
      _this.props.tab.title = title
    }, 300))
    tab.onActive = this.onActive
  }

  componentWillUnmount () {
    emitter.removeListener(E.PANEL_RESIZED, this.onResize)
    emitter.removeListener(E.THEME_CHANGED, this.onTheme)
    TerminalState.terminalManager.remove(this.terminal)
  }

  render () {
    const { tab } = this.props
    return (
      <div className='ide-terminal'>
        <div className='terminal-container'>
          <div className='terminal-body' data-droppable='TERMINAL' ref={r => this.termDOM = r}></div>
        </div>
      </div>
    )
  }

  onResize () {
    if (this.termDOM && this.termDOM.clientHeight > 0 && this.termDOM.clientWidth > 0) {
      this.terminal.fit()
    }
  }

  onActive () {
    setTimeout(() => {
      this.terminal.fit()
    })
  }

  onTheme (nextThemeId) {
    let theme = BRIGHT_THEME
    if (nextThemeId === 'dark') {
      theme = DARK_THEME
    }
    this.terminal.setOption('theme', theme)
  }
}

export default Term
