import menuBarItems from 'components/MenuBar/menuBarItems'

function insertMenuItemDeep (source, item, target) {
  for (let i = 0; i < target.length; i += 1) {
    const menuBar = source.find(menubar => menubar.key === target[i])
    if (menuBar && menuBar.items) {
      if (menuBar && i === target.length - 1) {
        menuBar.items = [...menuBar.items, item]
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
    menuBarItems.push(menuItem)
    return
  }
  const targetDepth = target.split('/')
  insertMenuItemDeep(menuBarItems, menuItem, targetDepth)
}
