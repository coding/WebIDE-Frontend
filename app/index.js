import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import './styles/main.styl'
import initialize from './initialize'

const baseTheme = require('!!style-loader/useable!css-loader!stylus-loader!./styles/base-theme/index.styl')
baseTheme.use()
window.themes = { '@current': baseTheme }

async function startApp (module) {
  await initialize()
  const rootElement = document.getElementById('root')
  if (__DEV__) {
    const hotLoaderRender = () =>
      render(<AppContainer><Root /></AppContainer>, rootElement)

    hotLoaderRender()
    if (module.hot) module.hot.accept('./containers/Root', hotLoaderRender)
  } else {
    render(<Root />, rootElement)
  }
}

startApp(module)

const log = console.log || (x => x)
if (__VERSION__) log(`[VERSION] ${__VERSION__}`)
