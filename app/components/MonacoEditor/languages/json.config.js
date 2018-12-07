export default {
  wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,
  comments: {
    lineComment: '//',
    blockComment: ['/*', '*/']
  },
  brackets: [['{', '}'], ['[', ']']],
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string'] },
    { open: '[', close: ']', notIn: ['string'] },
    { open: '"', close: '"', notIn: ['string'] }
  ]
}
