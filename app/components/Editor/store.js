import * as actions from './actions'
import state, { Editor } from './state'
import FileStore from 'commons/File/store'

class EditorStore {
  constructor () {
    Object.assign(this, actions)
  }

  getState () { return state }

  get (key) { return state.entities.get(key) }

  isValid (instance) {
    return (instance instanceof Editor && state.entities.has(instance.id))
  }

  create (config) {
    return new Editor(config)
  }
}

const store = new EditorStore()
export default store
