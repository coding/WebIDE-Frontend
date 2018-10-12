import { observable } from 'mobx'

export default observable({
  lineNumbers: true,
  selectOnLineNumbers: true,
  roundedSelection: true,
  minimap: {
    enabled: true,
    renderCharacters: false,
  },
  tabSize: 4,
  fontSize: 13,
  contextmenu: false,
  theme: 'vs-dark',
  glyphMargin: true,
  wordWrap: 'on',
})
