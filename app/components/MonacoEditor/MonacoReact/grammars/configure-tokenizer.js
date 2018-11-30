import { loadWASM } from 'onigasm' // peer dependency of 'monaco-textmate'
import { Registry } from 'monaco-textmate' // peer dependency
import { LanguageRegistry } from 'monaco-textmate-languages'
import { wireTmGrammars } from './set-grammars'

import grammars from './grammars'

/* eslint-disable */
import cssGrammar from '!raw-loader!./tmGrammars/css.json.tmLanguage'
import htmlGrammar from '!raw-loader!./tmGrammars/html.json.tmLanguage'
import tsGrammar from '!raw-loader!./tmGrammars/TypeScriptReact.tmLanguage'
/* eslint-enable */

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
    basePath: 'monaco-textmate-languages',
    jsonFetcher: async (uri) => {
      return (await fetch(`${window.location.origin}/${uri}`)).text()
    },
    // `jsonFetcher` also works (you must provide either of those)
    // jsonFetcher: (uri) => (await fetch(uri)).json(),
  })
  await wireTmGrammars(monaco, registry, grammars)
}
