import uniqueId from 'lodash/uniqueId'
import is from 'utils/is'
import { extendObservable, observable, computed, action } from 'mobx'
import CodeMirror from 'codemirror'
import FileStore from 'commons/File/store'

const state = observable({
  entities: observable.map({}),
})

class Editor {
  constructor (props = {}) {
    this.id = uniqueId('editor_')
    state.entities.set(this.id, this)
    this.update(props)
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
  set content (v) { return this._content = v }

  @action update (props = {}) {
    if (is.string(props.tabId)) this.tabId = props.tabId
    if (is.string(props.filePath)) this.filePath = props.filePath
    if (is.pojo(props.gitBlame)) this.gitBlame = props.gitBlame
    // file
    if (!this.file && props.content) {
      this._content = props.content
    }
    if (props.cm instanceof CodeMirror) this.cm = props.cm
  }
}

export default state
export { state, Editor }
