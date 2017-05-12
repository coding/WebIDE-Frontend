import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed } from 'mobx'
import FileStore from 'commons/File/store'

const state = observable({
  entities: observable.map({}),
})

class Editor {
  constructor (config={}) {
    this.id = uniqueId('editor_')
    if (config.filePath) this.filePath = config.filePath
    if (!this.file && config.content) {
      this._content = config.content
    }
    state.entities.set(this.id, this)
  }

  @observable tabId = ''
  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }

  @observable filePath = undefined
  @computed get file () { return FileStore.get(this.filePath) }

  @observable _content = ''
  @computed get content () {
    return this.file ? this.file.content : this._content
  }
}

export default state
export { state, Editor }
