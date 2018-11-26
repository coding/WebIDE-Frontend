import state, { terminalState } from 'components/Terminal/state'
import { addTerminal, removeTerminal } from 'components/Terminal/actions'

class Terminal {
  constructor (xterm) {
    this.name = xterm.id
    this.sendText = (text) => {
      xterm.emit('data', 'clear\r')
      xterm.emit('data', text + '\r')
    }

    this.active = () => {
      const tab = state.tabs.get(xterm.tabId)
      if (tab) {
        tab.activate()
      }
    }

    this.exit = () => {
      removeTerminal(xterm.tabId)
    }
  }
}
export function registerTerminalOpenHandler (fn) {
  function warpperListener (xterm) {
    const terminal = new Terminal(xterm)
    fn(terminal)
  }
  terminalState.didOpenListeners.push(warpperListener)
  return () => {
    terminalState.didOpenListeners = terminalState.didOpenListeners.filter(f => f !== warpperListener)
  }
}

export function createTerminal (id, shellPath) {
  addTerminal({ id, cwd: shellPath })
  return new Promise(resolve => {
    setTimeout(() => {
      const term = state.tabs.get(id).terminal
      resolve(new Terminal(term))
    }, 0)
  })
}
