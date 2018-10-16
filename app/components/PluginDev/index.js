import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import { dispatchCommand } from 'commands'
import { pluginDevStore } from 'components/Plugins/store'

@observer
class PluginDev extends PureComponent {
  render () {
    return (
      <div className='plugin-dev-container'>
        <div className='panel-heading'>
          <i className='icon fa fa-cubes' />
          {i18n`plugin.header`}
        </div>
        <a>如何开发 Cloud Studio 插件？</a>
        <p>请先确保已在终端内启动插件开发服务(yarn start)</p>
        <p>
          名称：
          <span>
            {pluginDevStore.infomation &&
              (pluginDevStore.infomation.displayName || pluginDevStore.infomation.name)}
          </span>
        </p>
        <p>
          描述：
          <span>{pluginDevStore.infomation && pluginDevStore.infomation.description}</span>
        </p>
        <p>
          版本：
          {pluginDevStore.infomation && pluginDevStore.infomation.version}
        </p>
        <p>
          插件服务状态：
          {pluginDevStore.online ? '连接成功' : '未连接'}
        </p>
        <p>
          编译状态：
          <span>{pluginDevStore.progress && pluginDevStore.progress.progress}%</span>
          <span>{pluginDevStore.progress && pluginDevStore.progress.msg}</span>
        </p>
        <button
          className='btn btn-default'
          onClick={() => dispatchCommand(pluginDevStore.online ? 'plugin:unmount' : 'plugin:mount')}
        >
          {pluginDevStore.online ? '卸载插件' : '加载插件'}
        </button>
        {pluginDevStore.online && (
          <button className='btn btn-default' onClick={() => dispatchCommand('plugin:remount')}>
            重载插件
          </button>
        )}
      </div>
    )
  }
}

export default PluginDev
