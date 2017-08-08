import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import './styles/main.styl'
import initialize from './initialize'
import InitializeContainer from './containers/Initialize'  

const baseTheme = require('!!style-loader/useable!css-loader!stylus-loader!./styles/base-theme/index.styl')
baseTheme.use()
window.themes = { '@current': baseTheme }

async function startApp (module) {
  const step = await initialize()
  if (!step.allSuccess) {
    return
  }
  if (__DEV__) {
    const hotLoaderRender = () =>
      render(<AppContainer><Root /></AppContainer>, rootElement)

    hotLoaderRender()
    if (module.hot) module.hot.accept('./containers/Root', hotLoaderRender)
  } else {
    render(<Root />, rootElement)
  }
}

const rootElement = document.getElementById('root')
render(<InitializeContainer startApp={() => startApp(module)} />, rootElement)

startApp(module)

const log = console.log || (x => x)
if (__VERSION__) log(`[VERSION] ${__VERSION__}`)
