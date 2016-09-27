/* @flow weak */
import React from 'react';
import { render } from 'react-dom';
import qs from 'querystring'

import Root from './containers/Root.jsx';
import './styles/main.styl';
import config from './config';

const {spaceKey} = qs.parse(window.location.hash.slice(1));
if (spaceKey) {
  window.isSpaceKeySet = true;
  config.spaceKey = spaceKey;
}

const app = React.createElement(Root);
render(app, document.getElementById('root'));
