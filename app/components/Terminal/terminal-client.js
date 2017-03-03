/* @flow weak */
import _ from 'lodash'
import config from '../../config'
import { request } from '../../utils'
const WORKSPACE_PATH = '/home/coding/workspace'
const BASE_PATH = '~/workspace'

var io = require(__RUN_MODE__ === 'platform' ? 'socket.io-client/dist/socket.io.min.js' : 'socket.io-client-legacy/dist/socket.io.min.js')

class Term {
  constructor ({id, cols, rows}) {
    this.id = id
    this.cols = cols
    this.rows = rows
    this.cwd = WORKSPACE_PATH
    this.spaceKey = config.spaceKey
  }
}

var terms = []
var socket = null
var online = false

class TerminalClient {

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

  createSocket () {
    if (config.isPlatform) {
      const wsUrl = config.wsURL
      const firstSlashIdx = wsUrl.indexOf('/', 8)
      let host, path
      if (firstSlashIdx !== -1) {
        host = wsUrl.substring(0, firstSlashIdx)
        path = wsUrl.substring(firstSlashIdx)
      } else {
        host = wsUrl
        path = ''
      }
      socket = io.connect(host, {
        'force new connection': true,
        'reconnection': true,
        'reconnectionDelay': 1500,
        'reconnectionDelayMax': 10000,
        'reconnectionAttempts': 5,
        path: `${path}/tty/${config.shardingGroup}/${config.spaceKey}/connect`,
        transports: ['websocket']
      })
    } else {
      socket = io.connect(config.baseURL, { 'resource': 'coding-ide-tty1' })
    }
    return this.bindSocketEvent()
  }

  bindSocketEvent () {
    socket.on('shell.output', (data) => {
      var term
      this.setOnline(true)
      term = _.find(terms, function (term) {
        return term.name === data.id
      })
      if (term) {
        return term.write(data.output)
      }
    })

    // socket.on('shell.exit', (data) => {
    //   var term;
    //   term = _.find(terms, function(term) {
    //     return term.name === data.id;
    //   });
    //   if (term) {
    //     return this.actions.close(term.tabId);
    //   }
    // });

    // socket.on('port.found', function(ports) {
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

    // socket.on('reconnect', (data) => {
    //   var i, j, len, results, term;
    //   results = [];
    //   for (i = j = 0, len = terms.length; j < len; i = ++j) {
    //     term = terms[i];
    //     results.push(this.add(term));
    //   }
    //   return results;
    // });

    // socket.on('disconnect', (data) => {
    //   return this.setOnline(false);
    // });

    // socket.on('connect', (data) => {
    //   return this.setOnline(true);
    // });
  }

  unbindSocketEvent () {
    socket.off('shell.output')
    socket.off('shell.exit')
    socket.off('reconnect')
    socket.off('disconnect')
    socket.off('connect')
    socket.off('port.found')
    socket.off('port.open')
  }

  add (term) {
    terms.push(term)
    if (!socket) this.createSocket()

    var termJSON = new Term({
      id: term.name,
      cols: term.cols,
      rows: term.rows
    })
    socket.emit('term.open', termJSON)
  }

  remove (removedTerm) {
    _.remove(terms, {id: removedTerm.name})
    socket.emit('term.close', {id: removedTerm.name})
    if (terms.length == 0) {
      socket.disconnect()
      this.unbindSocketEvent()
      socket = null
    }
  }

  resize (term, cols, rows) {
    if (socket) {
      socket.emit('term.resize', {id: term.name, rows, cols})
    }
  }

  getSocket () { return socket }

  clearBuffer (tabId) {
    var term = _.find(terms, term => term.tabId == tabId)
    socket.emit('term.input', {id: term.name, input: "printf '\\033c'\r" })
  }

  clearScrollBuffer (tabId) {
    var term = _.find(terms, term => term.tabId == tabId)
    term.clearScrollbackBuffer()
  }

  reset (tabId) {
    var term = _.find(terms, term => term.tabId == tabId)
    socket.emit('term.input', {id: term.name, input: '\f'})
  }

  input (tabId, inputString) {
    var term = _.find(terms, term => term.tabId == tabId)
    socket.emit('term.input', {id: term.name, input: inputString})
  }

  inputFilePath (tabId, inputPath) {
    this.input(tabId, BASE_PATH + inputPath)
  }
}

export default new TerminalClient()
