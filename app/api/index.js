import * as fileAPI from './fileAPI'
import * as gitAPI from './gitAPI'
import * as workspaceAPI from './workspaceAPI'

export default {
  ...fileAPI,
  ...gitAPI,
  ...workspaceAPI
}
