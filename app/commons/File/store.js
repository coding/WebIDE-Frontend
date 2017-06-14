import * as actions from './actions'
import state, { FileNode } from './state'

class FileStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  get (path) {
    const file = state.entities.get(path)
    return file
  }

  isValid (instance) {
    return (instance instanceof FileNode && state.entities.has(instance.id))
  }
}

const store = new FileStore()
export default store
