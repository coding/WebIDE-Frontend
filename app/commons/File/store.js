import * as actions from './actions'
import state, { FileNode } from './state'

class FileStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  get (path) {
    let file = state.entities.get(path)
    if (!file) throw Error(`File Not Found: ${path}`)
    return file
  }

  isValid (instance) {
    return (instance instanceof FileNode && state.entities.has(instance.id))
  }
}

const store = new FileStore()
export default store
