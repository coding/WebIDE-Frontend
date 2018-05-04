import * as fileAPI from './fileAPI'
import * as gitAPI from './gitAPI'
import * as packageAPI from './packageAPI'
import * as workspaceAPI from './workspaceAPI'
import * as websocketClients from './websocketClients'
import * as userAPI from './userAPI'
import * as projectAPI from './projectAPI'
import * as envApi from './envListAPI'

export default {
  ...fileAPI,
  ...gitAPI,
  ...packageAPI,
  ...workspaceAPI,
  ...userAPI,
  ...projectAPI,
  ...envApi,
}

export { websocketClients }
