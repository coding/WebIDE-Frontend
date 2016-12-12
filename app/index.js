/* @flow weak */
import React from 'react'
import { render } from 'react-dom'
import Root from './containers/Root'
import './styles/main.styl'
import { createI18n, getExtensions } from './utils'

window.i18n = createI18n
window.extensions = {}
window.extension = getExtensions

const app = React.createElement(Root)
render(app, document.getElementById('root'))
