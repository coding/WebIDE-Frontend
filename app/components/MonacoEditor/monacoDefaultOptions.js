import { observable } from 'mobx'

export default observable({
  lineNumbers: true,
  selectOnLineNumbers: true,
  roundedSelection: true,
  minimap: {
    enabled: true,
    renderCharacters: false,
  },
  tabSize: 2,
  fontSize: 13,
  contextmenu: true,
  theme: 'default-dark',
  glyphMargin: true,
  wordWrap: 'on',
  colorDecorators: true,
  showUnused: true,
})
