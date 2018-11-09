import React, { Component } from 'react';

import './prePublish.css';

import Know from '../../../share/know';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class PrePublish extends Component {
    state = {
        iknow: false,
    }

    render() {
        const { iknow } = this.state;
        const { hasPrePublish, isPrePublishBuilding } = this.props;
        const disabled = !iknow;
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
                <Know iknow={iknow} handler={this.handleKnow} />
                <div className="pre-publish-button">
                    {
                        !hasPrePublish ? (
                            <button className="com-button primary" disabled={disabled} onClick={this.handlePrePublish}>
                                {i18n('plugin.prePublish')}
                            </button>
                        ) : (
                            !isPrePublishBuilding ? (
                                <button className="com-button primary" disabled={disabled} onClick={this.handleCancelPrePublish}>{i18n('plugin.cancelPrePublish')}</button>
                            ) : <button className="com-button default building">{i18n('plugin.state3')}</button>
                        )
                    }
                </div>
            </div>
        );
    }

    handleKnow = (iknow) => {
        this.setState({ iknow });
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
