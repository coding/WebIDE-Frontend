import React, { Component, PropTypes } from 'react'
import { loadInnerPlugin } from 'components/Plugins/actions.js'
import { observer } from 'mobx-react'
import config from 'config'
import { i18n } from 'utils'
import state from './state'


@observer
class Initialize extends Component {
  componentWillMount () {
    loadInnerPlugin(require('../../plugin/index.js').default)
  }
  render () {
    let info = (
      <div className='loading-info'>
        {i18n`global.loadingWorkspace`}
      </div>
    )
    if (state.errorInfo) {
      info = (
        <div className='loading-info error'>
          {i18n`global.loadingWorkspaceFailed`}
        </div>
      )
    }

    return (
      <div className='initialize-container'>
        {config.isPlatform && <div className='coding-loading' />}
        {/* <div className='monkey splash-logo'></div> */}
        {info}
        {state.errorInfo && <div className='loading-error'>
          <i className='fa fa-exclamation-triangle' />
          {state.errorInfo}
        </div>}
      </div>
    )
  }
}

export default Initialize
