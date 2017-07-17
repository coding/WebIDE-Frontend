import state from './state'
import get from 'lodash/get'

export function getMenuItemByPath (path) {
  const actualPath = path.split('.').map(pathComp => `itemsMap.${pathComp}`).join('.')
  return get(state, actualPath)
}
