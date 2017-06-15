import Keymapper from './lib/keymapper'
import keymaps from './keymaps'
import commandBindings from './commandBindings'
import dispatchCommand from './dispatchCommand'
import { emitter } from 'utils'

const key = new Keymapper({ dispatchCommand })
key.loadKeymaps(keymaps)

Object.keys(commandBindings).map((commandType) => {
  emitter.on(commandType, commandBindings[commandType])
})

export dispatchCommand, { setContext } from './dispatchCommand'
export { CommandPalette } from './CommandPalette'
