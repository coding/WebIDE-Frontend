 

export default {
  id: 'vue',
  extensions: ['.vue'],
  aliases: ['Vue', 'vuejs'],
  loader: () => monaco.Promise.wrap(import('./vue')),
}
