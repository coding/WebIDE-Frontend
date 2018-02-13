import { AppContainer } from 'react-hot-loader'
import React from 'react'
import { render } from 'react-dom'
import Login from './containers/Root/login'
import './styles/main.styl'

const rootElement = document.getElementById('root')
async function startApp (module) {
  if (__DEV__) {
    const hotLoaderRender = () =>
      render(<AppContainer><Login /></AppContainer>, rootElement)

    hotLoaderRender()
    if (module.hot) module.hot.accept('./containers/Login', hotLoaderRender)
  } else {
    render(<Login />, rootElement)
  }
}

startApp(module)

const log = (...args) => console.log(...args) || (x => x)
if (__VERSION__) log(`[VERSION] ${__VERSION__}`)
