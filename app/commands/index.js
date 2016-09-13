import Keymapper from './lib/keymapper';
import keymaps from './keymaps';
import menuCommands from './menuCommands';

var key = new Keymapper();

key.loadKeymaps(keymaps);

key.loadCommandHandlers(menuCommands);

export const dispatchCommand = Keymapper.dispatchCommand;
