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
  if (!target || target === '') {
    if (isArray(menuItem)) {
      menuBarItems.concat(menuItem)
    } else {
      menuBarItems.push(menuItem)
    }
    return
  }
  const targetDepth = target.split('/')
  if (isArray(menuItem)) {
    for (const menu of menuItem) {
      insertMenuItemDeep(menuBarItems, menu, targetDepth)
    }
  } else {
    insertMenuItemDeep(menuBarItems, menuItem, targetDepth)
  }
}
