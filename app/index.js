/* @flow weak */
import React from 'react'
window.React = React // expose React to enable react devtool
import { render } from 'react-dom'
import Root from './containers/Root'
import './styles/main.styl'
import './styles/base-theme/index.styl'
import { createI18n, getExtensions } from './utils'

window.i18n = createI18n
window.extensions = {}
window.extension = f => getExtensions

const app = React.createElement(Root)
render(app, document.getElementById('root'))
