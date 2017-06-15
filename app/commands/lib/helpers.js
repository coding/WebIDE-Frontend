const keycodes = require('./keycodes')
const MODIFIERS_LIST = ['meta', 'ctrl', 'shift', 'alt']

export function keyEventToKeyCombination (e, combinator) {
  // ensure comb always in the order spec by MODIFIERS_LIST
  const modString = MODIFIERS_LIST.filter(mod => e[`${mod}Key`]).join(combinator)
  if (modString) {
    return [modString, keycodes.keyCodeToKey[e.keyCode]].join(combinator)
  }
  return keycodes.keyCodeToKey[e.keyCode]
}

export function normalizeKeys (keys, combinator, delimiter) {
  // validate keys spec, if valid, also unify order of modifiers as in MODIFIERS_LIST
  const keyCombos = keys.toLowerCase().replace(/\s/g, '').split(delimiter)
  return keyCombos.map((keyCombo) => {
    const keyEventObj = {}
    keyCombo.split(combinator).forEach((key) => {
      // 'meta' is also aliased as 'cmd' or 'super'
      if (key === 'cmd' || key === 'super') key = 'meta'
      if (MODIFIERS_LIST.indexOf(key) > -1) {
        keyEventObj[`${key}Key`] = true
      } else {
        keyEventObj.keyCode = keycodes.keyToKeyCode[key]
      }
    })
    if (typeof keyEventObj.keyCode !== 'number') {
      throw Error(`Keymapper: Unrecognized key combination \`${keyCombo}\``)
    }
    return keyEventToKeyCombination(keyEventObj, combinator)
  }).join(',')
}
