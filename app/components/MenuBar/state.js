import menuBarItems from './menuBarItems'
import MenuScope from 'commons/Menu/state'
import { autorun } from 'mobx'
import { observable } from 'mobx'

const { state, MenuItem } = MenuScope(menuBarItems)

autorun(() => {
  console.log('autorun', state, menuBarItems)
  state.items = observable.shallowArray(menuBarItems.map((opts) => {
    console.log(opts.name)
    return new MenuItem(opts)
  }))
})

window.state = state

export default state
