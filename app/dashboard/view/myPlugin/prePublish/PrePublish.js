import React, { Component } from 'react';

import './prePublish.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

const pushHref = 'https://studio.dev.tencent.com/plugins-docs/#推送到远端仓库';

class PrePublish extends Component {
    render() {
        const { hasPrePublish, isPrePublishBuilding } = this.props;
        return (
            <div className="panel">
                <div className="panel-title">
                    <div className="publish-tip">{i18n('plugin.prePublishTip')}</div>
                    {hasPrePublish && (
                        <div className="plugin-status">
                            {!isPrePublishBuilding ? i18n('plugin.hasPrePublish') : i18n('plugin.prePublishBuilding')}
                        </div>
                    )}
                </div>
                <div className="pre-publish-button">
                    <div className="pre-push-tip">
                        <i className="fa fa-exclamation-circle"></i>
                        {i18n('plugin.publishTip')}
                        <a href={pushHref} target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                    </div>
                    {
                        !hasPrePublish ? (
                            <button className="com-button primary" onClick={this.handlePrePublish}>
                                {i18n('plugin.prePublish')}
                            </button>
                        ) : (
                            !isPrePublishBuilding ? (
                                <button className="com-button primary" onClick={this.handleCancelPrePublish}>{i18n('plugin.cancelPrePublish')}</button>
                            ) : <button className="com-button default building">{i18n('plugin.state3')}</button>
                        )
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
        this.setState({ iknow : false });
    }

    handleCancelPrePublish = () => {
        const { preVersionId, refresh } = this.props;
        this.setState({ iknow: false });
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
