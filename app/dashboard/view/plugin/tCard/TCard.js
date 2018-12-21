import React, { Component } from 'react'

import Switch from '../../../share/switch'

import i18n from '../../../utils/i18n'
import api from '../../../api'
import config from '../../../utils/config'
import notification from 'components/Notification'

const httpReg = /^http/

class TCard extends Component {
  render () {
    const {
      id,
      pluginName,
      remark,
      userAvatar,
      createdBy,
      enableStatus,
      globalDisabled
    } = this.props
    const marketHref =
      window === window.top
        ? `${window.location.origin}/plugins/detail/${id}`
        : `${config.studioOrigin}/plugins/detail/${id}`
    const src = httpReg.test(userAvatar) ? userAvatar : `${config.qcloudOrigin}${userAvatar}`
    return (
      <div className={`plugin-card${globalDisabled ? ' disabled' : ''}`}>
        <div className='top'>
          <a className='name' href={marketHref} target='_blank' rel='noopener noreferrer'>
            {pluginName}
          </a>
          <div className='right'>
            <img src={src} />
            <span className='author'>{createdBy}</span>
          </div>
        </div>
        <div className='desc'>
          <span>{remark}</span>
        </div>
        <div className='control'>
          <div className='button-wrap'>
            <button className='button' onClick={this.handleUninstall}>
              {!globalDisabled ? i18n('global.uninstall') : i18n('global.remove')}
            </button>
          </div>
          {!globalDisabled ? (
            <Switch on={enableStatus === 1} handler={this.switchPluginEnable} />
          ) : (
            i18n('plugin.pluginDisabled')
          )}
        </div>
      </div>
    )
  }

  handleUninstall = () => {
    const { id, refresh } = this.props
    // status 为 1 表示安装，status 为 2 表示卸载
    api.uninstallPlugin({ pluginId: id, status: 2 }).then((res) => {
      if (res.code === 0) {
        refresh()
      } else {
        notification.error({
          description: res.msg
        })
      }
    })
  }

  switchPluginEnable = () => {
    const { id, enableStatus, refresh } = this.props
    // status 为 1 表示启用，status 为 2 表示禁用
    api.switchPluginEnable({ pluginId: id, status: enableStatus === 1 ? 2 : 1 }).then((res) => {
      if (res.code === 0) {
        refresh()
      } else {
        notification.error({
          description: res.msg
        })
      }
    })
  }
}

export default TCard
