import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export default {
  id: 'scheme',
  extensions: ['.scm', '.ss', '.sch', '.rkt'],
  aliases: ['scheme', 'Scheme'],
  loader: () => monaco.Promise.wrap(import('./scheme')),
}
