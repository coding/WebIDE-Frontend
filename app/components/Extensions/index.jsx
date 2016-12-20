import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as actions from './actions'


class ExtensionsView extends Component {
  static proptypes = {
    localExtensions: PropTypes.array,
    remoteExtensions: PropTypes.array,
    disabledExtensions: PropTypes.array,
    actions: PropTypes.object,
  }
  componentWillMount () {
    this.props.actions.fetchExtensionsLists()
    this.props.actions.updateExtensionCache()
  }
  createRemoteExtensions (data) {
    return Object.keys(data)
    .map(extension => (
      <div style={{ display: 'flex' }}>
        <p>名字： {data[extension].name}</p>
        <p>描述： {data[extension].desc}</p>
        {data[extension].hasDownloaded ? null : (
          <button onClick={() => this.props.actions.fetchExtensionByName(extension)}>
          下载并安装
          </button>
        )}
      </div>
    ))
  }
  createEnabledExtensions (data) {
    return Object.keys(data)
    .map(extension => (
      <div style={{ display: 'flex' }}>
        <p>名字： {data[extension].name}</p>
        <p>描述： {data[extension].desc}</p>
        <button onClick={() => this.props.actions.uninstallExtensionByName(extension)}>禁用</button>
      </div>
    ))
  }
  createDisabledExtensions (data) {
    return data.map(extension => (
      <div style={{ display: 'flex' }}>
         <p>名字: {extension}</p>
        <button onClick={() => this.props.actions.installLocalExtension(extension)}>启用</button>
      </div>
    ))
  }
  render () {
    const { localExtensions, remoteExtensions, disabledExtensions, cacheExtensions } = this.props
    const newRemoteExtensions = Object.keys(remoteExtensions).reduce((p, v) => {
      p[v] = { ...remoteExtensions[v], hasDownloaded: Object.keys(cacheExtensions).includes(v) }
      return p
    }, {})
    const createRemoteExtensions = this.createRemoteExtensions(newRemoteExtensions)
    const createEnabledExtensions = this.createEnabledExtensions(localExtensions)
    const createDisabledExtensions = this.createDisabledExtensions(disabledExtensions)

    return (
      <div name="container">
        <div name="remote_extensions">
          <div name="remote_extensions_lists">
            <p>the remote extensions</p>
            {createRemoteExtensions}
          </div>
        </div>
        <div name="extensions_lists">
          <div name="enabled_extensions">
            <p>the enabled extensions</p>
            {createEnabledExtensions}
          </div>
          <div name="disabled_extensions">
            <p>the disabled extensions</p>
            {createDisabledExtensions}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { localExtensions, remoteExtensions, cacheExtensions } = state.ExtensionState
  const disabledExtensions = Object.keys(cacheExtensions)
  .filter(key => !Object.keys(localExtensions).includes(key))
  return { localExtensions, remoteExtensions, disabledExtensions, cacheExtensions }
  // const cache
}

const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(actions, dispatch) })

export default connect(mapStateToProps, mapDispatchToProps)(ExtensionsView)
