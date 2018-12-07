export default {
  comments: {
    lineComment: 'REM'
  },
  brackets: [['{', '}'], ['[', ']'], ['(', ')']],
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' }
  ],
  surroundingPairs: [
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' }
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*(::\\s*|REM\\s+)#region'),
      end: new RegExp('^\\s*(::\\s*|REM\\s+)#endregion')
    }
  }
}
