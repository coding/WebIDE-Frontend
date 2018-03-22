import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import Intro from './containers/Root/intro'
import './styles/main.styl'

const rootElement = document.getElementById('root')
async function startApp (module) {
  if (__DEV__) {
    const hotLoaderRender = () =>
      render(<AppContainer><Intro /></AppContainer>, rootElement)

    hotLoaderRender()
    if (module.hot) module.hot.accept('./containers/Intro', hotLoaderRender)
  } else {
    render(<Intro />, rootElement)
  }
}

startApp(module)

const log = (...args) => console.log(...args) || (x => x)
if (__VERSION__) log(`[VERSION] ${__VERSION__}`)
