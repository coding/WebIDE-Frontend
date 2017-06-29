import * as actions from './actions'
import state from './state'

class MenuBarStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  get (path) {
    return this.getMenuItemByPath(path)
  }

}

const store = new MenuBarStore()
export default store
