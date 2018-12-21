import config from 'config'
import notification from 'components/Notification'
import languagesConfig from './languages'
import { INITIAL } from './monaco-textmate'

class TokenizerState {
  constructor (_ruleStack) {
    this._ruleStack = _ruleStack
  }
  get ruleStack () {
    return this._ruleStack
  }
  clone () {
    return new TokenizerState(this._ruleStack)
  }
  equals (other) {
    if (
      !other ||
      !(other instanceof TokenizerState) ||
      other !== this ||
      other._ruleStack !== this._ruleStack
    ) {
      return false
    }
    return true
  }
}

/**
 * Wires up monaco-editor with monaco-textmate
 *
 * @param monaco monaco namespace this operation should apply to (usually the `monaco` global unless you have some other setup)
 * @param registry TmGrammar `Registry` this wiring should rely on to provide the grammars
 * @param languages `Map` of language ids (string) to TM names (string)
 */
export function wireTmGrammars (monaco, registry, languages) {
  return Promise.all(
    Array.from(languages.keys()).map(async (languageId) => {
      const languageContrubution = languagesConfig.find(lang => lang.id === languageId)
      if (languageContrubution) {
        const { scopeName, ...contribution } = languageContrubution
        monaco.languages.register({ ...contribution })
        try {
          const grammar = await registry.loadGrammar(languages.get(languageId))
          monaco.languages.setTokensProvider(languageId, {
            getInitialState: () => new TokenizerState(INITIAL),
            tokenize: (line, state) => {
              if (line.length > 10000) {
                if (!config.tokenizationWarningAlreadyShown) {
                  console.warn(
                    'Too many characters! Tokenization is skipped for lines longer than 10k characters for performance reasons.'
                  )
                  notification.error({
                    description: i18n`editor.tokenizationWarning`
                  })
                  config.tokenizationWarningAlreadyShown = true
                }
                const tokens = new Uint32Array(2)
                tokens[0] = 0
                tokens[1] = ((1 << 0) | (0 << 8) | (0 << 11) | (1 << 14) | (2 << 23)) >>> 0
                return {
                  endState: new TokenizerState(state.ruleStack),
                  tokens: [
                    {
                      startIndex: 0,
                      scopes: '',
                      endIndex: line.length
                    }
                  ]
                }
              }
              const res = grammar.tokenizeLine(line, state.ruleStack)
              const tokenize = {
                endState: new TokenizerState(res.ruleStack),
                tokens: res.tokens.map(token => ({
                  ...token,
                  scopes: token.scopes[token.scopes.length - 1]
                }))
              }
              return tokenize
            }
          })
        } catch (e) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(e) // eslint-disable-line
          }
        }
      }
    })
  )
}
