export default {
  comments: {
    lineComment: "'",
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')'],
    ['<', '>'],
    ['addhandler', 'end addhandler'],
    ['class', 'end class'],
    ['enum', 'end enum'],
    ['event', 'end event'],
    ['function', 'end function'],
    ['get', 'end get'],
    ['if', 'end if'],
    ['interface', 'end interface'],
    ['module', 'end module'],
    ['namespace', 'end namespace'],
    ['operator', 'end operator'],
    ['property', 'end property'],
    ['raiseevent', 'end raiseevent'],
    ['removehandler', 'end removehandler'],
    ['select', 'end select'],
    ['set', 'end set'],
    ['structure', 'end structure'],
    ['sub', 'end sub'],
    ['synclock', 'end synclock'],
    ['try', 'end try'],
    ['while', 'end while'],
    ['with', 'end with'],
    ['using', 'end using'],
    ['do', 'loop'],
    ['for', 'next']
  ],
  autoClosingPairs: [
    { open: '{', close: '}', notIn: ['string', 'comment'] },
    { open: '[', close: ']', notIn: ['string', 'comment'] },
    { open: '(', close: ')', notIn: ['string', 'comment'] },
    { open: '"', close: '"', notIn: ['string', 'comment'] },
    { open: '<', close: '>', notIn: ['string', 'comment'] }
  ],
  folding: {
    markers: {
      start: new RegExp('^\\s*#Region\\b'),
      end: new RegExp('^\\s*#End Region\\b')
    }
  }
}
