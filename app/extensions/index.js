import * as file from './File.ext.js'
import * as git from './Git.ext.js'
import * as editor from './Editor.ext.js'
import * as menu from './Menu.ext.js'
import * as command from './command'
import * as modal from './Modal.ext.js'
import * as actions from './actions'
import * as terminal from './Terminal.ext.js'
import PluginContext, {
  appRegistry,
  registerPluginConfiguration,
  getPluginConfiguration,
  registerPluginConfigChangeHandler,
  IPropertiesType,
  createAdvancedProviderAndConnect
} from './PluginApp.ext.js'

export default {
  file,
  git,
  editor,
  menu,
  command,
  PluginContext,
  appRegistry,
  modal,
  actions,
  terminal,
  registerPluginConfiguration,
  getPluginConfiguration,
  registerPluginConfigChangeHandler,
  IPropertiesType,
  createAdvancedProviderAndConnect
}
