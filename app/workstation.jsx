import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import WorkStation from './workstation/workstationFull'
import './styles/workstation.styl'
import initialize from './initialize'
import InitializeContainer from './containers/Initialize'
import SettingState from 'components/Setting/state'
const uiTheme = SettingState.settings.appearance.ui_theme.value
if (uiTheme === 'light') {
  const lightTheme = require('!!style-loader/useable!css-loader!stylus-loader!./styles/light/index.styl')
  lightTheme.use()
  window.themes = { '@current': lightTheme }
} else {
  const darkTheme = require('!!style-loader/useable!css-loader!stylus-loader!./styles/dark/index.styl')
  darkTheme.use()
  window.themes = { '@current': darkTheme }
}

const rootElement = document.getElementById('root')
render(<InitializeContainer />, rootElement)

async function startApp (module) {
  if (__DEV__) {
    const hotLoaderRender = () =>
      render(<AppContainer><WorkStation /></AppContainer>, rootElement)

    hotLoaderRender()
    if (module.hot) module.hot.accept('./workstation/workstationFull', hotLoaderRender)
  } else {
    render(<Root />, rootElement)
  }
}

startApp(module)

const log = (...args) => console.log(...args) || (x => x)
if (__VERSION__) log(`[VERSION] ${__VERSION__}`)
