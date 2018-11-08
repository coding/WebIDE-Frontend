import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import { dispatchCommand } from 'commands'
import { pluginDevStore } from 'components/Plugins/store'

@observer
class PluginDev extends PureComponent {
  handleGoDoc = () => {
    window.open('/plugins-docs')
  }

  render () {
    return (
      <div className='plugin-dev-container'>
        <div className='panel-heading'>
          <p>
            <i className='icon fa fa-cubes' />
            {i18n`plugin.header`}
          </p>
          <span onClick={this.handleGoDoc}>
            <i className='fa fa-book' aria-hidden />
            开发文档
          </span>
        </div>
        <div className='plugin-detail-panel'>
          {/* <p className='plugin-detail-campaign'>
            插件开发大赛正在进行中，
            <a onClick={() => window.open('/campaign/favorite-plugins')}>了解更多</a>
          </p>*/}
          <p className='plugin-name'>
            {pluginDevStore.infomation &&
              (pluginDevStore.infomation.displayName || pluginDevStore.infomation.name)}
          </p>
          <p className='plugin-description'>
            {pluginDevStore.infomation && pluginDevStore.infomation.description}
          </p>
          <p className='plugin-description'>
            {pluginDevStore.infomation && `当前版本：${pluginDevStore.infomation.version}`}
          </p>
          <div className='plugin-dev-server'>
            <p>请先确保已在终端内启动插件(yarn start)</p>
            <p>
              插件状态：
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
              <button className='btn btn-default' style={{ marginLeft: '10px' }} onClick={() => dispatchCommand('plugin:remount')}>
                重载插件
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }
}

export default PluginDev
