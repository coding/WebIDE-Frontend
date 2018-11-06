import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './card.css';

import i18n from '../../../utils/i18n';
import api from '../../../api';
import config from '../../../utils/config';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

const httpReg = /^http/;

class Card extends Component {
    render() {
        const { id, pluginName, remark, userAvatar, createdBy, spaceKey, repoUrl, belong } = this.props;
        const to = {
            pathname: '/dashboard/plugin/developedbyme/setting',
            state: { pluginId: id },
        };
        const marketHref = window === window.top ? `${window.location.origin}/plugins/plugin/${id}` : `${config.studioOrigin}/plugins/plugin/${id}`;
        const titleHref = belong === 1 ? marketHref : repoUrl;
        const wsHref = window === window.top ? `${window.location.origin}/ws/${spaceKey}` : `${config.studioOrigin}/ws/${spaceKey}`;
        const src = httpReg.test(userAvatar) ? userAvatar : `${config.qcloudOrigin}${userAvatar}`;
        return (
            <div className="plugin-card">
                <div className="top">
                    <a className="name" href={titleHref} target="_blank" rel="noopener noreferrer">{pluginName}</a>
                    <div className="author">
                        <img src={src} />
                        <span>{createdBy}</span>
                    </div>
                </div>
                <div className="desc">{remark}</div>
                {belong === 1 && (
                    <div className="control">
                        <button className="button" onClick={() => this.handleUninstall(id)}>{i18n('global.uninstall')}</button>
                    </div>
                )}
                {belong === 3 && (
                    <div className="control">
                        <Link className="button" to={to}>{i18n('global.setting')}</Link>
                        <a className="button" href={wsHref} target="_blank" rel="noopener noreferrer">{i18n('global.workspace')}</a>
                    </div>
                )}
            </div>
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
