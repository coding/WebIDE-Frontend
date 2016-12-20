import * as fileAPI from './fileAPI'
import * as gitAPI from './gitAPI'
import * as packageAPI from './packageAPI'
import * as workspaceAPI from './workspaceAPI'

export default {
  ...fileAPI,
  ...gitAPI,
  ...packageAPI,
  ...workspaceAPI
}
