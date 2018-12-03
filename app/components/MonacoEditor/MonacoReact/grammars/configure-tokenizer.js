import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { LanguageRegistry } from 'monaco-textmate-languages'
import { wireTmGrammars } from './set-grammars'

import grammars from './grammars'

let wasmLoaded = false

export async function liftOff (monaco) {
  if (!wasmLoaded) {
    // eslint-disable-next-line global-require
    await loadWASM(require('onigasm/lib/onigasm.wasm')) // See https://www.npmjs.com/package/onigasm#light-it-up
    wasmLoaded = true
  } else {
    return
  }
  const registry = new LanguageRegistry({
    basePath: 'grammarsDefinition',
    jsonFetcher: async (uri) => {
      const relativeUri = uri.replace('/grammars', '')
      const result = require(`./${relativeUri}`)
      return JSON.stringify(result)
    },
  })
  await wireTmGrammars(monaco, registry, grammars)
}
