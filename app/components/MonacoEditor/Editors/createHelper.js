import {
  MonacoToProtocolConverter,
  ProtocolToMonacoConverter,
  MonacoCommands,
  MonacoLanguages,
  MonacoWorkspace,
  MonacoLanguageClient,
  createConnection
} from 'monaco-languageclient'
import io from 'socket.io-client'
import { lowerCase } from 'lodash'

import config from 'config'
import { documentSelectors } from '../utils/languages'
import initializationOptions from '../utils/initializationOptions'
import synchronize from '../utils/synchronize'

class ConsoleWindow {
  constructor () {
    this.channels = new Map()
  }

  showMessage (type, message) {
    const actions = []
    for (let _i = 2; _i < arguments.length; _i++) {
      actions[_i - 2] = arguments[_i]
    }
    if (type === services_1.MessageType.Error) {
      // no-op
    }
    if (type === services_1.MessageType.Warning) {
      // no-op
    }
    if (type === services_1.MessageType.Info) {
      // no-op
    }
    if (type === services_1.MessageType.Log) {
      // no-op
    }
    return Promise.resolve(undefined)
  }

  createOutputChannel = (name) => {
    const existing = this.channels.get(name)
    if (existing) {
      return existing
    }
    const channel = {
      append (value) {
        // no-op
      },
      appendLine (line) {
        // no-op
      },
      show () {
        // no-op
      },
      dispose () {
        // no-op
      }
    }
    this.channels.set(name, channel)
    return channel
  }
}

export function createMonacoServices (editor, options) {
  const m2p = new MonacoToProtocolConverter()
  const p2m = new ProtocolToMonacoConverter()
  return {
    commands: new MonacoCommands(editor),
    languages: new MonacoLanguages(p2m, m2p),
    workspace: new MonacoWorkspace(p2m, m2p, options.rootUri),
    window: new ConsoleWindow()
  }
}

export function createLanguageClient (services, connection) {
  const currentDocumentSelector = documentSelectors.find(v => v.lang === config.mainLanguage)
  const initializationOption = initializationOptions[config.mainLanguage]
  return new MonacoLanguageClient({
    name: `[${config.mainLanguage}-langServer]`,
    clientOptions: {
      commands: undefined,
      documentSelector: currentDocumentSelector.selectors,
      synchronize: {
        configurationSection: synchronize[config.mainLanguage]
      },
      initializationOptions: {
        ...initializationOption,
        workspaceFolders: [`file://${config._ROOT_URI_}`]
      },
      initializationFailedHandler: (err) => {
        const detail = err instanceof Error ? err.message : ''
      },
      diagnosticCollectionName: lowerCase(config.mainLanguage)
    },
    // services,
    connectionProvider: {
      get: (errorHandler, closeHandler) =>
        Promise.resolve(createConnection(connection, errorHandler, closeHandler))
    }
  })
}

const wsUrl = config.wsURL
const firstSlashIdx = wsUrl.indexOf('/', 8)
const [host, serverpath] =
  firstSlashIdx === -1
    ? [wsUrl, '']
    : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]

export function createWebSocket () {
  const socketOptions = {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 10000,
    path: `${serverpath}/javalsp/${config.spaceKey}`,
    transports: ['websocket'],
    query: {
      ws: config.spaceKey,
      language: lowerCase(config.mainLanguage)
    }
  }
  return io.connect(
    host,
    socketOptions
  )
}
