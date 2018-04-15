import _ from 'lodash'
import config from 'config'
import { autorun, observalbe, runInAction } from 'mobx'
import { TtySocketClient } from 'backendAPI/websocketClients'
import * as TabActions from 'components/Tab/actions'
import * as maskActions from 'components/Mask/actions'
import * as TermActions from './actions'
import * as SideBar from 'components/Panel/SideBar/actions'
import i18n from 'utils/createI18n'

const WORKSPACE_PATH = '/home/coding/workspace'
const BASE_PATH = '~/workspace'

const getTermJSON = ({ id, cols, rows }) => ({
  id,
  cols,
  rows,
  cwd: WORKSPACE_PATH,
  spaceKey: config.spaceKey,
})

const terms = []
let online = false

class TerminalClient extends TtySocketClient {
  constructor () {
    super()
  }

  setOnlineHandler (handler) {
    this.onlineHandler = handler
  }

  setOnline (_online) {
    if (online === _online) { return }
    online = _online
    this.onlineHandler && this.onlineHandler(online)
  }

  setActions (actions) {
    this.actions = actions
  }

  bindSocketEvent () {
    this.socket.on('shell.output', (data) => {
      let term
      this.setOnline(true)
      term = _.find(terms, term => term.id === data.id)
      if (term) {
        return term.write(data.output)
      }
    })

    this.socket.on('shell.exit', (data) => {
      let term
      term = _.find(terms, term => term.id === data.id)
      if (term) {
        this.remove(term)
        return TermActions.removeTerminal(term.tabId)
      }
    })

    // this.socket.on('port.found', function(ports) {
    //   var j, len, port, results;
    //   results = [];
    //   for (j = 0, len = ports.length; j < len; j++) {
    //     port = ports[j];
    //     if (!AccessUrl.get(port)) {
    //       results.push(AccessUrl.generate(port));
    //     }
    //   }
    //   return results;
    // });

    this.socket.on('connect', (data) => {
      if (!config.ttySocketConnected) runInAction(() => config.ttySocketConnected = true)
      let i, j, len
      for (i = j = 0, len = terms.length; j < len; i = ++j) {
        this.openTerm(terms[i])
      }
      clearTimeout(this.maskTimeout)
      maskActions.hideMask()
    })

    this.socket.on('disconnect', (type) => {
      console.log('terminal disconnect...')
      if (config.ttySocketConnected) runInAction(() => config.ttySocketConnected = false)
      if (type !== 'manual') {
        this.reconnect()
      }
    })

    // this.socket.on('connect', (data) => {
    //   return this.setOnline(true);
    // });

    this.unbindSocketEvent = () => {
      this.socket.off('shell.output')
      this.socket.off('shell.exit')
      this.socket.off('reconnect')
      this.socket.off('disconnect')
      this.socket.off('connect')
      this.socket.off('port.found')
      this.socket.off('port.open')
      delete this.unbindSocketEvent
    }

    return this.unbindSocketEvent
  }

  connectSocket () {
    this.maskTimeout = setTimeout(() => {
      if (!localStorage.getItem('firstEnter')) {
        maskActions.showMask({ message: i18n`global.preparingFirst`, countdown: 20 })
        localStorage.setItem('firstEnter', true)
      } else {
        maskActions.showMask({ message: i18n`global.preparing`, countdown: 20 })
      }
    }, 600)

    this.changeMaskTimeout = setTimeout(() => {
      maskActions.showMask({ type: 'switch' })
      // Modal.showModal('Alert', {
      //   header: i18n`global.ttyConnectFailed`,
      //   message: '',
      // })
    }, 60000)
    
    this.connect()
    if (!this.unbindSocketEvent) this.bindSocketEvent()
  }

  add (term) {
    terms.push(term)
    this.openTerm(term)
  }

  openTerm (term) {
    if (!config.ttySocketConnected) {
      this.connectSocket()
    } else {
      const termJSON = getTermJSON({
        id: term.id,
        cols: term.cols,
        rows: term.rows
      })
      this.socket.emit('term.open', termJSON)
    }
  }

  remove (removedTerm) {
    _.remove(terms, { id: removedTerm.id })
    if (this.socket) {
      this.socket.emit('term.close', { id: removedTerm.id })
    }
    if (terms.length == 0) {
      // this.socket.disconnect()
      this.close()
      if (this.unbindSocketEvent) this.unbindSocketEvent()
      this.socket = null
      SideBar.hideSidePanelView('SIDEBAR.BOTTOM.terminal')
    }
  }

  resize (term, cols, rows) {
    if (this.socket) {
      this.socket.emit('term.resize', { id: term.id, rows, cols })
    }
  }

  getSocket () { return this.socket }

  clearBuffer (tabId) {
    const term = _.find(terms, term => term.id == tabId)
    this.socket.emit('term.input', { id: term.id, input: "printf '\\033c'\r" })
  }

  clearScrollBuffer (tabId) {
    const term = _.find(terms, term => term.id == tabId)
    term.clearScrollbackBuffer()
  }

  reset (tabId) {
    const term = _.find(terms, term => term.id == tabId)
    this.socket.emit('term.input', { id: term.id, input: '\f' })
  }

  input (tabId, inputString) {
    const term = _.find(terms, term => term.id == tabId)
    this.socket.emit('term.input', { id: term.id, input: inputString })
  }

  inputFilePath (tabId, inputPath) {
    this.input(tabId, BASE_PATH + inputPath)
  }
}

export default TerminalClient
