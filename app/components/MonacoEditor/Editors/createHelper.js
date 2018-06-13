import { createConnection } from 'vscode-base-languageclient/lib/connection'
import { BaseLanguageClient } from 'vscode-base-languageclient/lib/base'

import config from 'config'
import io from 'socket.io-client'
import { documentSelectors } from '../utils/languages'

export function createLanguageClient (services, connection, language) {
  const currentDocumentSelector = documentSelectors.find(v => v.lang === config.mainLanguage)
  return new BaseLanguageClient({
    name: `[${config.mainLanguage}-langServer]`,
    clientOptions: {
      commands: undefined,
      documentSelector: currentDocumentSelector.selectors,
      synchronize: {},
      initializationFailedHandler: (err) => {
        const detail = err instanceof Error ? err.message : ''
      },
      diagnosticCollectionName: language,
    },
    services,
    connectionProvider: {
      get: (errorHandler, closeHandler) =>
        Promise.resolve(createConnection(connection, errorHandler, closeHandler)),
    },
  })
}

const wsUrl = config.wsURL
const firstSlashIdx = wsUrl.indexOf('/', 8)
const [host, serverpath] = firstSlashIdx === -1 ? [wsUrl, ''] : [wsUrl.substring(0, firstSlashIdx), wsUrl.substring(firstSlashIdx)]

export function createWebSocket () {
  const socketOptions = {
    reconnection: false,
    reconnectionDelay: 10000,
    path: `${serverpath}/javalsp/${config.spaceKey}`,
    transports: ['websocket'],
    query: {
      ws: config.spaceKey
    }
  }
  return io.connect(host, socketOptions)
}
