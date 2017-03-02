import { UIthemeOption } from '../components/Setting/reducer'
import { getState } from '../store'


const initTheme = () => {
    const themes = UIthemeOption.reduce((p, v) => {
    p[v] = require(`../styles/${v}/index.styl`)
    return p
    }, {})
    const currentThemeValue = getState().SettingState.data.tabs.THEME.items[0].value
    const currentThemeInstance = themes[currentThemeValue].use()
    window.themes = themes
}

export const changeTheme = (next) => {
    const currentThemeValue = getState().SettingState.views.tabs.THEME.items[0].value
    if (next !== currentThemeValue) {
        window.themes[currentThemeValue].unuse()
        window.themes[next].use()
    }
}
export const changeCodeTheme = (next) => {
    const nextTheme = next.split('/').pop()
    const currentThemeValue = getState().SettingState.views.tabs.THEME.items[1].value
    const editors = window.ide.editors
    if (Object.keys(editors).length && nextTheme !== currentThemeValue) {
        Object.keys(editors).forEach(editor => {
            editors[editor].setOption('theme', nextTheme)
        });
    }
}

export default initTheme