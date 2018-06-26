import * as fileAPI from './fileAPI'
import * as gitAPI from './gitAPI'
import * as packageAPI from './packageAPI'
import * as workspaceAPI from './workspaceAPI'
import * as websocketClients from './websocketClients'
import * as userAPI from './userAPI'
import * as projectAPI from './projectAPI'
import * as projectSettingAPI from './projectSettingApi'

export default {
  ...fileAPI,
  ...gitAPI,
  ...packageAPI,
  ...workspaceAPI,
  ...userAPI,
  ...projectAPI,
  ...projectSettingAPI,
}

export { websocketClients }
