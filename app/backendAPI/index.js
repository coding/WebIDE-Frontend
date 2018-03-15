import * as fileAPI from './fileAPI'
import * as gitAPI from './gitAPI'
import * as packageAPI from './packageAPI'
import * as workspaceAPI from './workspaceAPI'
import * as websocketClients from './websocketClients'
import * as userAPI from './userAPI'

export default {
  ...fileAPI,
  ...gitAPI,
  ...packageAPI,
  ...workspaceAPI,
  ...userAPI
}

export { websocketClients }
