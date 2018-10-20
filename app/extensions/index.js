import * as file from './file.ext'
import * as git from './git.ext'
import * as editor from './editor.ext'
import * as menu from './menu.ext'
import * as command from './command'
import * as modal from './modal.ext'
import * as actions from './actions'
import * as terminal from './terminal.ext'
import PluginApp, { appRegistry, registerPluginConfiguration, getPluginConfiguration, registerPluginConfigChangeHandler } from './pluginApp.ext'

export default {
  file,
  git,
  editor,
  menu,
  command,
  PluginApp,
  appRegistry,
  modal,
  actions,
  terminal,
  registerPluginConfiguration,
  getPluginConfiguration,
  registerPluginConfigChangeHandler,
}
