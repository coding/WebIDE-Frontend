import { emitter } from 'utils'
import Keymapper from './lib/keymapper'
import keymaps from './keymaps'
import commandBindings from './commandBindings'
import dispatchCommand, { setContext, addCommand } from './dispatchCommand'
import { CommandPalette } from './CommandPalette'

const key = new Keymapper({ dispatchCommand })
key.loadKeymaps(keymaps)

Object.keys(commandBindings).map((commandType) => {
  emitter.on(commandType, commandBindings[commandType])
})

export { dispatchCommand, setContext, CommandPalette, addCommand }
