import { UIthemeOptions } from '../components/Setting/reducer'
import { getState } from '../store'


const initTheme = () => {
    // const themes = UIthemeOptions.reduce((p, v) => {
    // p[v] = require(`../styles/${v}/index.styl`)
    // return p
    // }, {})
    // const currentThemeValue = getState().SettingState.data.tabs.THEME.items[0].value
    // const currentThemeInstance = themes[currentThemeValue].use()
    // window.themes = themes
}

export const changeTheme = (next) => {
    const currentThemeValue = getState().SettingState.views.tabs.THEME.items[0].value
    if (next !== currentThemeValue) {
        window.themes[currentThemeValue].unuse()
        window.themes[next].use()
    }
}

export default initTheme
