import keyMapConfig, { keybordSettings } from '../../commands/keymaps';


const findKeyByValue = (value) => Object
    .keys(keyMapConfig)
    .reduce((p, v) => {
        p[keyMapConfig[v]] = v;
        return p;
    }, {})[value] || ''

const getSignByKey = (value) => {
    return value.split('+')
    .map(e => keybordSettings[e] || e.toUpperCase()).join(' ')
}


const mapShortcutToConfig = (configs) => {
    return configs.map(config => ({
        ...config,
        items: config.items.map(item => ({
            ...item,
            shortcut: getSignByKey(findKeyByValue(item.command))
        }))
    }))
}
export default mapShortcutToConfig

