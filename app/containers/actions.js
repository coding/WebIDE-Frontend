import { registerAction } from 'utils/actions'
import { ExtensionsCache } from 'utils/extensions'

import store from './store'


export const CONTAINER_REGISTER_VIEW = 'CONTAINER_REGISTER_VIEW'

export const containersRegister = registerAction(CONTAINER_REGISTER_VIEW, (children) => {
  const childrenArray = Array.isArray(children) ? children : [children]
  childrenArray.forEach((child) => {
    const { position, key, label, view, instanceId } = child
    const generateViewId = `${position}_${key}${instanceId ? `_${instanceId}` : ''}`
    store.extensions.labels.set(generateViewId, {
      viewId: generateViewId,
      position,
      key,
      ...label
    })
    store.extensions.views[generateViewId] = view
  })
})


export const addComToContainers = (position, label, getComponent) => {
  const key = label.key
  const extension = ExtensionsCache.get(label.key)
  const view = label.key && getComponent(extension, ExtensionsCache)

  return containersRegister({
    position,
    key,
    label,
    view
  })
}
