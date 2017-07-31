import { registerAction } from 'utils/actions'
import { ExtensionsCache } from 'utils/extensions'
import get from 'lodash/get'
import state from './state'
import store from './store'


export function getMenuItemByPath (path) {
  const actualPath = path.split('.').map(pathComp => `itemsMap.${pathComp}`).join('.')
  return get(state, actualPath)
}

export const MENUBAR_REGISTER_VIEW = 'MENUBAR_REGISTER_VIEW'

export const menuBarRegister = registerAction(MENUBAR_REGISTER_VIEW, (children) => {
  const childrenArray = Array.isArray(children) ? children : [children]
  childrenArray.forEach((child) => {
    const { position, key, label, view, instanceId } = child
    const generateViewId = `${position}_${key}${instanceId ? `_${instanceId}` : ''}`
    store.labels.set(generateViewId, {
      viewId: generateViewId,
      position,
      key,
      ...label
    })
    store.views[generateViewId] = view
  })
})


export const addComToMenuBar = (position, label, getComponent) => {
  const key = label.key
  const extension = ExtensionsCache.get(label.key)
  const view = label.key && getComponent(extension)

  return menuBarRegister({
    position,
    key,
    label,
    view
  })
}
