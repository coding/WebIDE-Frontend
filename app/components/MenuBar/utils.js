import keyMapConfig, { modifierKeysMap } from '../../commands/keymaps'


const findKeyByValue = value => Object
    .keys(keyMapConfig)
    .reduce((p, v) => {
      p[keyMapConfig[v]] = v
      return p
    }, {})[value] || ''

const withModifierKeys = value => value.split('+')
    .map(e => modifierKeysMap[e] || e.toUpperCase()).join('')


const mapShortcutToConfig = configs => configs.map(config => ({
  ...config,
  items: config.items.map(item => ({
    ...item,
    shortcut: withModifierKeys(findKeyByValue(item.command))
  }))
}))
export default mapShortcutToConfig

