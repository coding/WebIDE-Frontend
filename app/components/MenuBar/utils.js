import keyMapConfig, { modifierKeysMap } from '../../commands/keymaps'
import { observable, extendObservable } from 'mobx'

const findKeyByValue = value => Object
    .keys(keyMapConfig)
    .reduce((p, v) => {
      p[keyMapConfig[v]] = v
      return p
    }, {})[value] || ''

const withModifierKeys = value => value.split('+')
    .map(e => modifierKeysMap[e] || e.toUpperCase()).join('')


const mapShortcutToConfig = configs => observable(configs.map(config => (
  extendObservable(config, {
    items: config.items.map(item => (
      extendObservable(item, {
        shortcut: withModifierKeys(findKeyByValue(item.command))
      })))
  })))
)
export default mapShortcutToConfig

