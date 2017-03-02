/* @flow weak */
import { AppContainer } from 'react-hot-loader';
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import { createI18n, getExtensions } from './utils'
import initTheme from './utils/themeManager'
require ('./styles/main.styl').use()

// expose some api
// todo wrapper all extension apis with getApis(key)
window.React = React // expose React to enable react devtool
window.refs = {}
window.i18n = createI18n
window.extensions = {}
window.extension = f => getExtensions
// init theme and extension
initTheme()


// render and hot reload
const rootElement = document.getElementById('root')
if (__DEV__) {
  const hotLoaderRender = () =>
    render(<AppContainer><Root /></AppContainer>, rootElement)

  hotLoaderRender()
  if (module.hot) module.hot.accept('./containers/Root', hotLoaderRender)

} else {
  render(<Root />, rootElement)
}
