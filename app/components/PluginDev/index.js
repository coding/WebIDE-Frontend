import React, { PureComponent } from 'react'
import { observer } from 'mobx-react'
import { dispatchCommand } from 'commands'
import api from 'backendAPI'
import { pluginDevStore, pluginProjectInfomation } from 'components/Plugins/store'

@observer
class PluginDev extends PureComponent {
  componentDidMount () {
    api.getMyPlugin()
      .then((res) => {
        if (res.data) {
          const projectRepoUrl = (config.project && config.project.httpsUrl) || ''
          const projectInfomation = res.data.find(project => project.repoUrl === projectRepoUrl)
          if (projectInfomation) {
            pluginProjectInfomation.pluginName = projectInfomation.pluginName
            pluginProjectInfomation.description = projectInfomation.remark
            pluginProjectInfomation.version = projectInfomation.currentVersion
            pluginProjectInfomation.pluginId = projectInfomation.id
          }
        }
      })
  }

  handleGoDoc = () => {
    window.open('/plugins-docs')
  }

  handleDeploy = () => {
    window.open(`/dashboard/plugin/mine/${pluginProjectInfomation.pluginId}`)
  }

  render () {
    const deleted = !pluginProjectInfomation.pluginId;
    return (
      <div className='plugin-dev-container'>
        <div className='panel-heading'>
          <p>
            <i className='icon fa fa-cubes' />
            {i18n`plugin.header`}
          </p>
          <p>
            {!deleted && (
              <span onClick={this.handleDeploy} style={{ cursor: 'pointer', marginRight: 10 }}>
                <i className='fa fa-paper-plane' aria-hidden />
                <span>发布插件</span>
              </span>
            )}
            <span onClick={this.handleGoDoc} style={{ cursor: 'pointer' }}>
              <i className='fa fa-book' aria-hidden />
              <span>开发文档</span>
            </span>
          </p>
        </div>
        <p className='plugin-detail-campaign'>
          <span>插件开发大赛正在进行中，</span>
          <a href="https://studio.qcloud.coding.net/campaign/favorite-plugins/" target="_blank" rel="noopener">了解更多</a>
          <span>。</span>
        </p>
        <div className='plugin-detail-panel'>
          {deleted && (
            <p className="plugin-deleted-tip">
              <i className="fa fa-exclamation-triangle"></i>
              <span>该插件已被删除，无法发布</span>
            </p>
          )}
          {!deleted && (
            <p className='plugin-name'>
              插件名：
            {pluginProjectInfomation.pluginName}
            </p>
          )}
          {!deleted && (
            <p className='plugin-description'>
              插件描述：
            {pluginProjectInfomation.description}
            </p>
          )}
          {!deleted && (
            <p className='plugin-description'>
              当前版本：
              {pluginProjectInfomation.version}
            </p>
          )}
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
            {pluginDevStore.online && (
              <button
                className='btn btn-default'
                style={{ marginRight: '10px', color: '#2D9CDB' }}
                onClick={() => dispatchCommand('plugin:remount')}
              >
                重载插件
              </button>
            )}
            <button
              className='btn btn-default'
              onClick={() => dispatchCommand(pluginDevStore.online ? 'plugin:unmount' : 'plugin:mount')}
            >
              {pluginDevStore.online ? '卸载插件' : '加载插件'}
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default PluginDev
