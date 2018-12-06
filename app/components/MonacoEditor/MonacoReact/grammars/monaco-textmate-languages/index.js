import grammars from './manifest'
import languages from '../languages'

import { Registry } from '../monaco-textmate'

export default class LanguageRegistry extends Registry {
  constructor (config) {
    Object.freeze(config)
    super({
      theme: config.theme,
      getGrammarDefinition: async (scopeName) => {
        const grammar = grammars.find(o => o.scopeName === scopeName)
        if (grammar) {
          const uri =
            `${config.basePath +
            (config.basePath.endsWith('/') ? '' : '/')
            }grammars/${
            grammar.path}`
          let json = null
          let err = null
          if (typeof config.jsonFetcher === 'function') {
            try {
              json = await config.jsonFetcher(uri)
            } catch (error) {
              err = error
            }
          }
          if (json === null && typeof config.textFetcher === 'function') {
            try {
              json = await config.textFetcher(uri)
            } catch (error) {
              // `jsonFetcher` error gets higher priority over `textFetcher` error
              if (err) {
                throw err
              } else {
                throw error
              }
            }
          }
          return {
            format: 'json',
            content: json
          }
        }
        return null
      }
    })
  }
  /**
   * Returns Grammar by language ID
   * @param langId Language ID (Example: `html`, `typescript`)
   */
  getLanguageGrammar (langId) {
    const lang = languages.find(l => l.id === langId)
    if (!lang) {
      throw new Error(
        'Language with id \'{langId}\' not found in the manifest. Check for spellings or try searching with extension or mime type'
      )
    }
    return super.loadGrammar(lang.scopeName)
  }
  /**
   * Returns Grammar by file extension
   * @param ext File extension (Example: `.tsx`, `.css`)
   */
  getLanguageGrammarByExtension (ext) {
    if (!ext.startsWith('.')) {
      ext = `.${ext}`
    }
    const lang = languages.find(l => l.extensions.some(ext1 => ext1 === ext))
    if (!lang) {
      throw new Error(
        `No language matches with extension '${ext}'. Check for spellings or try searching with language ID or mime type`
      )
    }
    return super.loadGrammar(lang.scopeName)
  }
  /**
   * Return Grammar by MIME type
   * @param mime Mime type (Example: `application/javascript`, `text/html`)
   */
  getLanguageGrammarByMimeType (mime) {
    const lang = languages.find(l => l.mimeType.some(mimeType => mimeType === mime))
    if (!lang) {
      throw new Error(
        `No language matches with mime '${mime}'. Check for spellings or try searching with language ID or file extension`
      )
    }
    return super.loadGrammar(lang.scopeName)
  }
}
