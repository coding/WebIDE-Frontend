import state from './state'
import isFunction from 'lodash/isFunction'
import isArray from 'lodash/isArray'
import { createAction, handleAction, registerAction } from 'utils/actions'

const OPEN_CONTEXT_MENU = 'menu:open_context_menu'
handleAction(OPEN_CONTEXT_MENU, ({ isActive, pos, contextNode, items }) => {
  state.isActive = isActive
  state.pos = pos
  state.contextNode = contextNode
  if (isArray(items)) state.items = items
})

function openContextMenuFactory (items) {
  if (!isFunction(items) && !isArray(items)) {
    throw Error('Invalid arg passed to \'openContextMenuFactory\', require arg of Function or Array type')
  }
  const getContextMenuItems = isFunction(items) ? items : (() => items)
  return (e, context) => openContextMenu(e, context, getContextMenuItems(context))
}

const openContextMenu = createAction(OPEN_CONTEXT_MENU, (e, context, items = []) => {
  e.stopPropagation()
  e.preventDefault()
  return {
    isActive: true,
    pos: { x: e.clientX, y: e.clientY },
    contextNode: context,
    items
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
