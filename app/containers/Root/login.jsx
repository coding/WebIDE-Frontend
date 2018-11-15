import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import { Provider as MobxProvider } from 'mobx-react'

import Login from '../Login'

class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    // this.props.dispatch(initState()) // initLifecycle_2
  }
  render () {
    return <Login />
  }
}

// Root = connect(null)(Root)

export default () => {
  return (
      <Root id='root-container' />
  )
}
