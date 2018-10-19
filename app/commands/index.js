import { emitter } from 'utils'
import Keymapper from './lib/keymapper'
import { systemKeymaps, pluginsKeymaps } from './keymaps'
import commandBindings from './commandBindings'
import { flattenKeyMaps } from './lib/helpers'
import dispatchCommand, { setContext, addCommand } from './dispatchCommand'
import { CommandPalette } from './CommandPalette'
// import { pluinKeymapsForPlatform } from './pluginsKeymaps'
export const key = new Keymapper({ dispatchCommand })
key.loadKeymaps(systemKeymaps)

pluginsKeymaps.forEach((keyConfig) => {
  key.loadKeymaps(flattenKeyMaps(keyConfig.keymaps))
})

Object.keys(commandBindings).map((commandType) => {
  emitter.on(commandType, commandBindings[commandType])
})

export { dispatchCommand, setContext, CommandPalette, addCommand }
