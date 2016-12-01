/* @flow weak */
import React from 'react'
import { render } from 'react-dom'
import qs from 'querystring'

import Root from './containers/Root'
import './styles/main.styl'
import config from './config'
import { createI18n } from './utils'

const {spaceKey} = qs.parse(window.location.hash.slice(1))
if (spaceKey) {
  window.isSpaceKeySet = true
  config.spaceKey = spaceKey
}

window.i18n = createI18n
window.extensions = {}

const app = React.createElement(Root)
render(app, document.getElementById('root'))
