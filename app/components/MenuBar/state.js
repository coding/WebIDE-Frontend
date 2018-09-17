import menuBarItems from './menuBarItems'
import MenuScope from 'commons/Menu/state'
import { autorun } from 'mobx'
import { observable } from 'mobx'

const { state, MenuItem } = MenuScope(menuBarItems)

autorun(() => {
  state.items = observable.shallowArray(menuBarItems.sort((a, b) => {
    return a.weight - b.weight;
  }).map((opts) => {
    return new MenuItem(opts);
  }))
})

export default state
