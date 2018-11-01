import { isArray } from 'lodash'
import { observable } from 'mobx'
import menuBarItems from 'components/MenuBar/menuBarItems'

function insertMenuItemDeep (source, item, target) {
  for (let i = 0; i < target.length; i += 1) {
    const menuBar = source.find(menubar => menubar.key === target[i])
    if (menuBar && menuBar.items) {
      if (menuBar && i === target.length - 1) {
        menuBar.items = [...menuBar.items, observable(item)]
        break
      } else {
        insertMenuItemDeep(menuBar.items, item, target.slice(i + 1))
        break
      }
    }
  }
}

export function registerMenu (menuItem, target) {
  const menuItems = isArray(menuItem) ? menuItem : [menuItem]
  if (!target || target === '') {
    for (const menu of menuItems) {
      if (!menu.items) {
        throw new Error(`${menu.key} items is required!`)
      }
      menuBarItems.push(menu)
    }
    return
  }
  const targetDepth = target.split('/')
  for (const menu of menuItems) {
    insertMenuItemDeep(menuBarItems, menu, targetDepth)
  }
}
