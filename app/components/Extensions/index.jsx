import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'


class ExtensionsView extends Component {
  getRemoteExtensions () {
    return <div>remote_extensions_lists</div>
  }
  getEnabledExtensions () {
    return <div>enalbed_extensions_lists</div>
  }
  getDisabledExtensions () {
    return <div>disabled_extensions_lists</div>
  }
  render () {
    const remoteExtensions = this.getRemoteExtensions()
    const enabledExtensions = this.getEnabledExtensions()
    const disabledExtensions = this.getDisabledExtensions()
    return (
      <div name="container">
        <div name="remote_extensions">
          <div name="remote_extensions_manager">
            <button>下载插件</button>
            <button>获取插件列表</button>
          </div>
          <div name="remote_extensions_lists">
            {remoteExtensions}
          </div>
        </div>
        <div name="extensions_lists">
          <div name="enabled_extensions">
            {enabledExtensions}
          </div>
          <div name="disabled_extensions">
            {disabledExtensions}
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  // const localExtensions = state.extensions
}


export default connect(mapStateToProps)(ExtensionsView)
