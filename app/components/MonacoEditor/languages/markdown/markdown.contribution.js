export default {
  id: 'markdown',
  extensions: ['.md', '.markdown', '.mdown', '.mkdn', '.mkd', '.mdwn', '.mdtxt', '.mdtext'],
  aliases: ['Markdown', 'markdown'],
  loader: () => monaco.Promise.wrap(import('./markdown'))
}
