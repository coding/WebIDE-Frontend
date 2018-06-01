import { CloseAction, ErrorAction } from 'monaco-languageclient'
// import { workspace as vscodeWorkSpace } from 'vscode'
import { createConnection } from 'vscode-base-languageclient/lib/connection'
import { BaseLanguageClient } from 'vscode-base-languageclient/lib/base'

import config from 'config'
import { documentSelectors } from '../utils/languages'
import SockJS from 'sockjs-client'
import io from 'socket.io-client'

export function createLanguageClient (workspace, services, connection, language) {
  const currentDocumentSelector = documentSelectors.find(v => v.lang === config.mainLanguage)
  return new BaseLanguageClient({
    name: `[${config.mainLanguage}-langServer]`,
    clientOptions: {
      commands: undefined,
      documentSelector: currentDocumentSelector.selectors,
      synchronize: {},
      initializationFailedHandler: (err) => {
        const detail = err instanceof Error ? err.message : ''
        console.log(detail)
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

const path = '/ide-ws/javalsp'

const url = 'http://test.coding.ide'

export function createWebSocket () {
  const socketOptions = {
    reconnection: false,
    reconnectionDelay: 10000,
    path: `${path}/${config.spaceKey}`,
    transports: ['websocket'],
    query: {
      ws: config.spaceKey
    }
  }
  return io.connect(url, socketOptions)
}
