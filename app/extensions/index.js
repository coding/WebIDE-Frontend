import * as file from './file.ext.js'
import * as git from './git.ext.js'
import * as editor from './editor.ext.js'
import * as menu from './menu.ext.js'
import * as command from './command'
import * as modal from './modal.ext.js'
import * as actions from './actions'
import * as terminal from './terminal.ext.js'
import PluginApp, { appRegistry, registerPluginConfiguration, getPluginConfiguration, registerPluginConfigChangeHandler, IPropertiesType } from './PluginApp.ext.js'

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
  IPropertiesType,
}
