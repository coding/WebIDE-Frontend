/* @flow weak */
import { AppContainer } from 'react-hot-loader';
import React from 'react'
window.React = React // expose React to enable react devtool
import { render } from 'react-dom'
import Root from './containers/Root'
import './styles/main.styl'
import './styles/base-theme/index.styl'
import { createI18n, getExtensions } from './utils'

window.refs = {}
window.i18n = createI18n
window.extensions = {}
window.extension = f => getExtensions

const rootElement = document.getElementById('root')

if (__DEV__) {
  const hotLoaderRender = () =>
    render(<AppContainer><Root /></AppContainer>, rootElement)

  hotLoaderRender()
  if (module.hot) module.hot.accept('./containers/Root', hotLoaderRender)

} else {
  render(<Root />, rootElement)
}
