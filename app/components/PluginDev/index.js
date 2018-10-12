import React, { PureComponent } from 'react'
import { dispatchCommand } from 'commands'

class PluginDev extends PureComponent {
  render() {
    return (
      <div className='plugin-dev-container'>
        <div className="panel-heading">
          <i className="icon fa fa-cubes" />{i18n`plugin.header`}
        </div>
        <button className='btn btn-default' onClick={e => dispatchCommand('plugin:mount')}>加载插件</button>
        <button className='btn btn-default' onClick={e => dispatchCommand('plugin:unmount')}>卸载插件</button>
      </div>
    )
  }
}

export default PluginDev
