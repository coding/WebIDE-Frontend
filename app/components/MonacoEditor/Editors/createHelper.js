import {
  BaseLanguageClient,
  CloseAction,
  ErrorAction,
  createConnection,
} from 'monaco-languageclient'

const ReconnectingWebSocket = require('reconnecting-websocket')

export function createLanguageClient (connection, services) {
  return new BaseLanguageClient({
    name: 'Sample Language Client For Monaco',
    clientOptions: {
      // use a language id as a document selector
      documentSelector: ['typescript'],
      // disable the default error handler
      errorHandler: {
        error: () => ErrorAction.Continue,
        closed: () => CloseAction.DoNotRestart,
      },
    },
    services,
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: (errorHandler, closeHandler) =>
        Promise.resolve(createConnection(connection, errorHandler, closeHandler)),
    },
  });
}


export function createWebSocket (url) {
  const socketOptions = {
    maxReconnectionDelay: 10000,
    minReconnectionDelay: 1000,
    reconnectionDelayGrowFactor: 1.3,
    connectionTimeout: 10000,
    maxRetries: Infinity,
    debug: false,
  }
  return new ReconnectingWebSocket(url, undefined, socketOptions)
}
