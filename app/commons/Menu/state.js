import React from 'react'
import { observable, extendShallowObservable } from 'mobx'

function MenuScope (defaultMenuItems=[]) {

  class MenuItem {
    constructor (opts) {
      const keys = Object.keys(opts)
      keys.forEach((keyName) => {
        switch (keyName) {
          case 'items':
            const subItems = opts.items.map(itemOpts => new MenuItem(itemOpts))
            return extendShallowObservable(this, {
              items: subItems,
              get itemsMap () {
                return this.items.reduce((acc, item) => {
                  if (item.key) acc[item.key] = item
                }, {})
              }
            })
          // case 'key':
          // case 'name':
          // case 'className':
          // case 'command':
          // case 'isDisabled':
          default:
            return extendShallowObservable(this, { [keyName]: opts[keyName] })
        }
      })
      return this
    }
  }

  const state = observable({
    items: observable.shallowArray(defaultMenuItems.map(opts => new MenuItem(opts))),
    get itemsMap () {
      return this.items.reduce((acc, item) => {
        if (item.key) acc[item.key] = item
      }, {})
    }
  })

  return { state, MenuItem }
}

export default MenuScope
