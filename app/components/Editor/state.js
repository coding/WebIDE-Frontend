import { extendObservable, observable, computed } from 'mobx'
import { registerAction } from 'utils/actions'

const state = observable({
  editors: observable.map({}),
})

class Editor {
  constructor (config={}) {
    extendObservable(this, config)
  }

  @observable gitBlame = {
    show: false,
    data: observable.ref([]),
  }
}


export default state
export { state, Editor }
