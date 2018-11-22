import React, { Component } from 'react';

import i18n from '../../../utils/i18n';
import api from '../../../api';
import config from '../../../utils/config';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

const httpReg = /^http/;

class TCard extends Component {
    render() {
        const { id, pluginName, remark, userAvatar, createdBy } = this.props;
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${id}` : `${config.studioOrigin}/plugins/detail/${id}`;
        const src = httpReg.test(userAvatar) ? userAvatar : `${config.qcloudOrigin}${userAvatar}`;
        return (
            < div className="plugin-card" >
                <div className="top">
                    <a className="name" href={marketHref} target="_blank" rel="noopener noreferrer">{pluginName}</a>
                    <div className="right">
                        <img src={src} />
                        <span>{createdBy}</span>
                    </div>
                </div>
                <div className="desc">
                    <span>{remark}</span>
                </div>
                <div className="control">
                    <button className="button" onClick={() => this.handleUninstall(id)}>{i18n('global.uninstall')}</button>
                </div>
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

export default TCard;
