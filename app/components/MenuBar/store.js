import * as actions from './actions'
import { extendObservable, observable } from 'mobx'
import state from './state'


class MenuBarStore {
  constructor () {
    Object.assign(this, actions)
    this.labels = observable.map({})
  }

  getState () { return state }

  get (path) {
    return this.getMenuItemByPath(path)
  }
}


const store = new MenuBarStore()
export default (store)
