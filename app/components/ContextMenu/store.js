import state from './state'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import { createAction, handleAction, registerAction } from 'utils/actions'

const OPEN_CONTEXT_MENU = 'menu:open_context_menu'
handleAction(OPEN_CONTEXT_MENU, ({ isActive, pos, contextNode, items, className }) => {
  state.isActive = isActive
  state.pos = pos
  state.contextNode = contextNode
  state.className = className
  if (isArray(items)) state.items = items
})

function openContextMenuFactory (items, margin, className) {
  if (!isFunction(items) && !isArray(items)) {
    throw Error('Invalid arg passed to \'openContextMenuFactory\', require arg of Function or Array type')
  }
  const getContextMenuItems = isFunction(items) ? items : (() => items)
  return (e, context) => openContextMenu(e, context, getContextMenuItems(context), margin, className)
}

const regJava = /\.java$/;
const regTest = /\.test$/;

const openContextMenu = createAction(OPEN_CONTEXT_MENU, (e, context, items = [], margin = { x: 0, y: 0, relative: false }, className = '') => {
  e.stopPropagation()
  e.preventDefault()
  const menuItems = [...items];
  // java文件才有生成测试文件菜单
  if (!regJava.test(context.path.toLowerCase())) {
      for (let i = 0, n = menuItems.length; i < n; i++) {
          const item = menuItems[i];
          if (item && item.command === 'file:generate_unit_test') {
              menuItems.splice(i, 1);
          }
      }
  }
  // 单元测试文件才能运行单元测试
  if (!regTest.test(context.path.toLowerCase())) {
      for (let i = 0, n = menuItems.length; i < n; i++) {
          const item = menuItems[i];
          if (item && item.command === 'file:run_unit_test') {
              menuItems.splice(i, 1);
          }
      }
  }
  let pos = { x: e.clientX + margin.x, y: e.clientY + margin.y }
  if (margin.relative) {
    const rect = e.target.getBoundingClientRect()
    pos = { x: rect.x + rect.width + margin.x, y: rect.y + rect.height + margin.y }
  }
  return {
    isActive: true,
    pos,
    contextNode: context,
    items: menuItems,
    className
  }
})

const CLOSE_CONTEXT_MENU = 'menu:close_context_menu'
const closeContextMenu = registerAction(CLOSE_CONTEXT_MENU, () => {
  state.isActive = false
  state.contextNode = null
})

const store = {
  getState () {
    return state
  },

  openContextMenuFactory,
  openContextMenu,
  closeContextMenu,
}

export default store
