import uniqueId from 'lodash/uniqueId'
import { extendObservable, observable, computed, action } from 'mobx'
import FileStore from 'commons/File/store'

const state = observable({
  entities: observable.map({}),
})

class Editor {
  constructor (props={}) {
    this.id = uniqueId('editor_')
    if (props.filePath) this.filePath = props.filePath
    if (!this.file && props.content) {
      this._content = props.content
    }
    if (props.gitBlame) this.gitBlame = props.gitBlame
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

  @action update (props={}) {
    if (props.filePath) this.filePath = props.filePath
    if (props.gitBlame) this.gitBlame = props.gitBlame
  }
}

export default state
export { state, Editor }
