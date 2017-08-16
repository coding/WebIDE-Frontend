import Mousetrap from 'mousetrap'
import { normalizeKeys } from './helpers'

Mousetrap.prototype.stopCallback = function () { return false }

class Keymapper {
  constructor ({ dispatchCommand }) {
    this.dispatchCommand = dispatchCommand
  }

  loadKeymaps (keymaps) {
    Object.entries(keymaps).map(([keycombo, commandType]) => {
      Mousetrap.bind(normalizeKeys(keycombo), (e) => {
        this.dispatchCommand(commandType)
        e.preventDefault(); e.stopPropagation()
      })
    })
  }
}

export default Keymapper
