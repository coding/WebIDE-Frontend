import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'

export default {
  id: 'vue',
  extensions: ['.vue'],
  aliases: ['Vue', 'vuejs'],
  loader: () => monaco.Promise.wrap(import('./vue')),
}
