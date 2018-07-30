import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export default {
  id: 'clojure',
  extensions: ['.clj', '.clojure'],
  aliases: ['Clojure', 'clojure'],
  loader: () => monaco.Promise.wrap(import('./clojure')),
}
