import { CloseAction, ErrorAction } from 'monaco-languageclient'
// import { workspace as vscodeWorkSpace } from 'vscode'
import { createConnection } from 'vscode-base-languageclient/lib/connection'
import { BaseLanguageClient } from 'vscode-base-languageclient/lib/base'

import io from 'socket.io-client'
// console.log(vscodeWorkSpace)
export function createLanguageClient (workspace, services, connection, language) {
  return new BaseLanguageClient({
    name: 'java',
    clientOptions: {
      commands: undefined,
      documentSelector: [
        { scheme: 'file', language: 'java' },
        { scheme: 'jdt', language: 'java' },
        { scheme: 'untitled', language: 'java' }
      ],
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


export function createWebSocket (url) {
  const socketOptions = {
    reconnection: false,
    reconnectionDelay: 10000,
  }
  return io(url, socketOptions)
}
