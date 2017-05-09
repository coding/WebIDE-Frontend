import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed } from 'mobx'

const state = observable({
  entities: observable.map({}),
})

class Editor {
  constructor (config={}) {
    this.id = uniqueId('editor_')
    if (config.filePath) this.file = FileStore.get(config.filePath)
    if (!this.file && config.content) {
      this._content = config.content
    }

    state.entities.set(this.id, this)
  }

  @observable.ref file = null
  @observable _content = ''
  @computed get content () {
    return this.file ? this.file.content : this._content
  }
  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }
}

export default state
export { state, Editor }
