import React, { Component } from 'react';

import './prePublish.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class PrePublish extends Component {
    render() {
        const { hasPrePublish } = this.props;
        return (
            <div className="panel">
                <div className="panel-title">
                    <div className="publish-tip">{i18n('plugin.prePublishTip')}</div>
                    {hasPrePublish && <div className="plugin-status">{i18n('plugin.hasPrePublish')}</div>}
                </div>
                <div className="pre-publish-button">
                    {
                        !hasPrePublish ? (
                            <button className="com-button primary" onClick={this.handlePrePublish}>{i18n('plugin.prePublish')}</button>
                        ) : <button className="com-button primary" onClick={this.handleCancelPrePublish}>{i18n('plugin.cancelPrePublish')}</button>
                    }
                </div>
            </div>
        );
    }

    handlePrePublish = () => {
        const { pluginId, release } = this.props;
        // 预发布与发布是同一个接口，isPreDeploy字段不同
        const option = {
            pluginId,
            version: '',
            description: '[pre publish]',
            isPreDeploy: true,
        }
        release(option);
    }

    handleCancelPrePublish = () => {
        const { preVersionId, refresh } = this.props;
        api.cancelPrePublish({ versionId: preVersionId }).then(res => {
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

export default PrePublish;
