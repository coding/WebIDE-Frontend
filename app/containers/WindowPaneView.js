/* @flow weak */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PaneView from '../components/Pane';
import store from '../store.js';

const WindowPaneViewContainer = connect( state => {
  return state.WindowPaneState;
})(PaneView);

const WindowPaneView = ({config, ...otherProps}) => {
  store.dispatch({
    type: 'PANE_INITIALIZE',
    scope: 'window',
    config: config
  });

  return (<WindowPaneViewContainer scope='window' {...otherProps} />);
}

export default WindowPaneView;
