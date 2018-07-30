import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export default {
  id: 'shell',
  extensions: ['.sh', '.bash'],
  aliases: ['Shell Script', 'sh'],
  loader: () => monaco.Promise.wrap(import('./shell'))
}
