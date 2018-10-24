const keycodes = require('./keycodes')
const MODIFIERS_LIST = ['meta', 'ctrl', 'shift', 'alt']

const os = (navigator.platform.match(/mac|win|linux/i) || ['other'])[0].toLowerCase()
export const isMac = (os === 'mac')

export function keyEventToKeyCombination (e, combinator) {
  // ensure comb always in the order spec by MODIFIERS_LIST
  const modString = MODIFIERS_LIST.filter(mod => e[`${mod}Key`]).join(combinator)
  if (modString) {
    return [modString, keycodes.keyCodeToKey[e.keyCode]].join(combinator)
  }
  return keycodes.keyCodeToKey[e.keyCode]
}

export function normalizeKeys (keys, combinator='+', delimiter=' ') {
  // validate keys spec, if valid, also unify order of modifiers as in MODIFIERS_LIST
  return keys.toLowerCase().split(delimiter).map((keyCombo) => {
    const keyEventObj = {}
    keyCombo.split(combinator).forEach((key) => {
      // 'meta' is also aliased as 'cmd' or 'super'
      if (key === 'cmd' || key === 'command' || key === 'super') key = 'meta'
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
  })
  .join(delimiter)
}

export function flattenKeyMaps (keymaps) {
  return keymaps.reduce((pre, cur) => {
    const { mac, win, command } = cur
    if (isMac) {
      pre[mac] = command
    } else {
      pre[win] = command
    }
    return pre
  }, {})
}
