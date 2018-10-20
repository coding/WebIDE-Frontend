import { isArray } from 'lodash'
import { registerAction } from 'utils/actions'
import emitter from 'utils/emitter'
import { observable } from 'mobx'
import { key as keymapper } from 'commands'

import * as dispatcher from 'commands/dispatchCommand'
import keymapStore from 'commands/keymaps'
import { flattenKeyMaps } from 'commands/lib/helpers'

export function registerCommand (commandType, handler) {
  registerAction(commandType, (...args) => {
    const [state, payload, actionMsg] = args
    handler(isArray(payload) ? payload[0] : payload)
  })
  return () => {
    emitter.removeListener(commandType)
  }
}

export function executeCommand (commandType, data) {
  dispatcher.default(commandType, data)
}


export function registerKeyBindings (keyBinds) {
  const { name } = keyBinds

  keymapStore.pluginsKeymaps = keymapStore.pluginsKeymaps.find(keyconfig => keyconfig.name === name)
    ? keymapStore.pluginsKeymaps.map(keyconfig => keyconfig.name === name ? keyBinds : keyconfig)
    : observable([...keymapStore.pluginsKeymaps, keyBinds])

  keymapStore.pluginsKeymaps.forEach((keyconfig) => {
    const keys = flattenKeyMaps(keyconfig.keymaps)
    keymapper.loadKeymaps(keys)
  })
  return () => {
    keymapStore.pluginsKeymaps.forEach((keyconfig) => {
      const keys = flattenKeyMaps(keyconfig.keymaps)
      keymapper.unbindKeymaps(keys)
    })
  }
}
