import { observable, extendObservable } from 'mobx'
import keyMapConfig, { modifierKeysMap } from 'commands/keymaps'

const findKeyByValue = value => Object
    .keys(keyMapConfig)
    .reduce((p, v) => {
      p[keyMapConfig[v]] = v
      return p
    }, {})[value] || ''

const withModifierKeys = value => value.split('+')
    .map(e => modifierKeysMap[e] || e.toUpperCase()).join('')


function MenuScope (defaultMenuItems=[]) {

  class MenuItem {
    constructor (props) {
      let subItems
      if (Array.isArray(props.items)) {
        subItems = props.items.map(itemProps => new MenuItem(itemProps))
        delete props.items
      }
      extendObservable(this, props)

      if (subItems) extendObservable(this, { items: subItems })
      if (this.command) {
        extendObservable(this, {
          get shortcut () {
            return withModifierKeys(findKeyByValue(this.command))
          }
        })
      }
      return this
    }
  }

  const state = observable({
    items: defaultMenuItems.map(props => new MenuItem(props)),
  })

  return { state, MenuItem }
}

export default MenuScope
