export default {
  wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,

  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },

  brackets: [['{', '}'], ['[', ']'], ['(', ')']],

  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string'] },
    { open: '[', close: ']', notIn: ['string'] },
    { open: '(', close: ')', notIn: ['string'] },
    { open: '"', close: '"', notIn: ['string'] },
    { open: "'", close: "'", notIn: ['string', 'comment'] }
  ],

  folding: {
    markers: {
      start: new RegExp('^\\s*(#|//)region\\b'),
      end: new RegExp('^\\s*(#|//)endregion\\b')
    }
  }
}
