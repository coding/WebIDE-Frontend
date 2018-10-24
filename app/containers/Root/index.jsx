import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Provider, connect } from 'react-redux'
import { Provider as MobxProvider } from 'mobx-react'
import { PluginRegistry } from 'utils/plugins'
import store from '../../store' // initLifecycle_1: gives the defaultState
import mobxStore from '../../mobxStore'
import IDE from '../IDE'
import { initState } from './actions'

class Root extends Component {
  static proptypes = {
    dispatch: PropTypes.func
  }
  componentWillMount () {
    // this.props.dispatch(initState()) // initLifecycle_2
  }
  componentDidMount () {
    const plugins = PluginRegistry.findAllByType('Required')
    plugins.forEach((plugin) => {
      if (plugin.detaultInstance.pluginDidMount) {
        plugin.detaultInstance.pluginDidMount(plugin)
      }
    })
  }
  render () {
    return <IDE />
  }
}

Root = connect(null)(Root)

export default () => {
  return (
    <Provider store={store}>
      <MobxProvider {...mobxStore} >
      <Root id='root-container' />
      </MobxProvider>
    </Provider>
  )
}
