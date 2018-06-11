import { observable } from 'mobx'

export default observable({
  lineNumbers: true,
  selectOnLineNumbers: true,
  roundedSelection: true,
  minimap: {
    enabled: true,
    renderCharacters: false,
  },
  fontSize: 13,
  contextmenu: false,
  theme: 'vs-dark'
})
