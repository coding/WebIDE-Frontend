import Mousetrap from 'mousetrap'
import { normalizeKeys } from './helpers'

Mousetrap.prototype.stopCallback = function () { return false }

class Keymapper {
  constructor ({ dispatchCommand }) {
    this.dispatchCommand = dispatchCommand
    this.keyStore = []
  }

  loadKeymaps (keymaps) {
    Object.entries(keymaps).map(([keycombo, commandType]) => {
      if (!this.keyStore.includes(keycombo)) {
        this.keyStore.push(keycombo)
        Mousetrap.bind(normalizeKeys(keycombo), (e) => {
          this.dispatchCommand(commandType)
          e.preventDefault(); e.stopPropagation()
        })
      }
    })
  }

  unbindKeymaps (keymaps) {
    Object.entries(keymaps).map(([keycombo]) => {
      if (this.keyStore.includes(keycombo)) {
        this.keyStore = this.keyStore.filter((key) => key !== keycombo)
      }
      Mousetrap.unbind(normalizeKeys(keycombo))
    })
  }
}

export default Keymapper
