/* @flow weak */
import React, { Component, PropTypes } from 'react'
import { Provider, connect } from 'react-redux'

import store from '../../store' // initLifecycle_1: gives the defaultState
import IDE from '../IDE'
import { initState } from './actions'

class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    this.props.dispatch(initState()) // initLifecycle_2
  }
  render () {
    return <IDE />
  }
}

Root = connect(null)(Root)

export default () => {
  return (
    <Provider store={store}>
      <Root id='root-container' />
    </Provider>
  )
}
