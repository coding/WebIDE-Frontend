import { UIThemeOptions } from '../components/Setting/reducer'
import { getState } from '../store'

export const changeTheme = (nextThemeId, force) => {
  const currentThemeId = getState().SettingState.views.tabs.THEME.items[0].value
  if (!window.themes) window.themes = {}

  if (nextThemeId !== currentThemeId || force) {
    if (UIThemeOptions.includes(nextThemeId)) {
      import(`!!style-loader/useable!css-loader!stylus-loader!../styles/${nextThemeId}/index.styl`).then(module => {
        const currentTheme = window.themes['@current']
        if (currentTheme && currentTheme.unuse) currentTheme.unuse()
        window.themes['@current'] = window.themes[nextThemeId] = module
        module.use()
      })
    }
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
