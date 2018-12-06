export default {
  comments: {
    blockComment: ['<!--', '-->']
  },
  brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '<', close: '>', notIn: ['string'] }
  ],
  surroundingPairs: [
    { open: '(', close: ')' },
    { open: '[', close: ']' },
    { open: '`', close: '`' }
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*<!--\\s*#?region\\b.*-->'),
      end: new RegExp('^\\s*<!--\\s*#?endregion\\b.*-->')
    }
  }
}
