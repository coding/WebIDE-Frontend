import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './card.css';

import i18n from '../../../utils/i18n';
import api from '../../../api';
import config from '../../../utils/config';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import parseStatus from '../../pluginSet/status';

const httpReg = /^http/;

class Card extends Component {
    render() {
        const { id, pluginName, remark, userAvatar, createdBy, repoName, pluginVersions, belong } = this.props;
        const { version, status, hasPrePublish, preStatus } = parseStatus(pluginVersions);
        const to = {
            pathname: '/dashboard/plugin/mine/manage/',
            state: { pluginId: id },
        };
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${id}` : `${config.studioOrigin}/plugins/detail/${id}`;
        const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${createdBy}&projectName=${repoName}`;
        const src = httpReg.test(userAvatar) ? userAvatar : `${config.qcloudOrigin}${userAvatar}`;
        return (
            < div className = "plugin-card" >
                <div className="top">
                    {
                        status === 5 ? (
                            <a className="name" href={marketHref} target="_blank" rel="noopener noreferrer">{pluginName}</a>
                        ) : <span className="name">{pluginName}</span>
                    }
                    {belong === 1 && (
                        <div className="right">
                            <img src={src} />
                            <span>{createdBy}</span>
                        </div>
                    )}
                    {belong === 3 && (
                        <div className="right">
                            {status === 5 && <div className="version">v{version}</div>}
                            {
                                (hasPrePublish && preStatus === 2) ? (
                                    <div className="tag">{i18n('plugin.prePublish')}</div>
                                ) : (status === 5 && <div className="tag">{i18n('plugin.published')}</div>)
                            }
                        </div>
                    )}
                </div>
                <div className="desc">
                    <span>{remark}</span>
                    <span className="ellipsis"></span>
                </div>
                {belong === 1 && (
                    <div className="control">
                        <button className="button" onClick={() => this.handleUninstall(id)}>{i18n('global.uninstall')}</button>
                    </div>
                )}
                {belong === 3 && (
                    <div className="control">
                        <Link className="button" to={to}>{i18n('global.manage')}</Link>
                        <a className="button" href={wsHref} target="_blank" rel="noopener noreferrer">{i18n('global.workspace')}</a>
                    </div>
                )}
            </div >
        );
    }

    handleUninstall = (pluginId) => {
        const { refresh } = this.props;
        // status 为 2 表示禁用
        api.uninstallPlugin({ pluginId, status: 2 }).then(res => {
            if (res.code === 0) {
                refresh();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

export default Card;
