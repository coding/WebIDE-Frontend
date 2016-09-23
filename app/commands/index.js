/* @flow weak */
import Keymapper from './lib/keymapper'
import keymaps from './keymaps'
import commandBindings from './commandBindings'

var key = new Keymapper()
key.loadKeymaps(keymaps)
key.loadCommandHandlers(commandBindings)

export const dispatchCommand = Keymapper.dispatchCommand
export const setScope = Keymapper.setScope
export const setContext = Keymapper.setContext
export { CommandPalette } from './CommandPalette'
