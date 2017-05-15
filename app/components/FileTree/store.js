import * as actions from './actions'
import state from './state'

class FileTreeStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  get (key) { return state.entities.get(key) }

}

const store = new FileTreeStore()
export default store
