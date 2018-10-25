import React, { Component } from 'react';

import './management.css';

import Publish from '../publish';
import Star from '../../../share/star';
import Inbox from '../../../share/inbox';
import api from '../../../api';
import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Management extends Component {
    state = {
        pluginId: '',
        pluginName: '',
        remark: '',
        version: '0.0.0',
        versionId: '',
        pluginType: '',
        avgScore: 3,
        countScoreUser: 2327,
        status: 0,
        isPrePublish: false,
        tab: 1,
        newPluginName: '',
        newRemark: '',
        newVersion: '',
    }

    render() {
        const { pluginId, pluginName, remark, version, pluginType, avgScore, countScoreUser, status, isPrePublish, tab } = this.state;
        const { newPluginName, newRemark } = this.state;
        const disabled = !newPluginName || !newRemark;
        return (
            <div className="dash-developedbyme-config">
                <div className="top">
                    <div className="plugin-name">{pluginName}</div>
                    <a className="goto" href="" target="_blank" rel="noopener noreferrer">{i18n('ws.gotoWS')}</a>
                </div>
                <div className="desc">{remark}</div>
                <div className="info">
                    <div className="item">
                        <span className="key">{i18n('plugin.currentRelease')}:</span>
                        <span>{version ? `v${version}` : 'null'}</span>
                    </div>
                    <div className="item">
                        <span className="key">{i18n('global.category')}:</span>
                        <span>{pluginType}</span>
                    </div>
                    <div className="item">
                        <Star score={avgScore} />
                        <span className="rate-user-count">({kilo(countScoreUser)})</span>
                    </div>
                </div>
                <div className="audit-status">{i18n(`plugin.status${status}`, { version })}</div>
                {isPrePublish && (
                    <div className="cancel-prepublish">
                        {i18n('plugin.hasPrePublish')}
                        <span className="click" onClick={this.handleCancelPrePublish}>{i18n('plugin.cancelPublish')}</span>
                    </div>
                )}
                <div className="tab">
                    <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>基本设置</div>
                    <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>发布新版本</div>
                </div>
                {
                    tab === 1 && (
                        <div className="panel">
                            <div className="panel-title"></div>
                            <div className="com-board">
                                <div className="board-label">{i18n('plugin.pluginName')}*</div>
                                <div className="board-content">
                                    <Inbox holder="plugin.inputPluginName" value={newPluginName} onChange={this.handlePluginName} />
                                </div>
                            </div>
                            <div className="com-board">
                                <div className="board-label">{i18n('global.desc')}*</div>
                                <div className="board-content">
                                    <Inbox type="textarea" holder="plugin.inputPluginDesc" value={newRemark} onChange={this.handleRemark} />
                                </div>
                            </div>
                            <div className="com-board">
                                <div className="board-label none"></div>
                                <div className="board-content">
                                    <button className="com-button primary" disabled={disabled} onClick={this.handleSave}>{i18n('global.save')}</button>
                                </div>
                            </div>
                        </div>
                    )
                }
                {tab === 2 && (
                    status !== 1 ? (
                        <Publish version={version} pluginId={pluginId} fetchInfo={this.fetchPluginInfo} />
                    ) : <div className="cannot-publish">{i18n('plugin.cannotPublish')}</div>
                )}
            </div>
        );
    }

    componentDidMount() {
        this.fetchPluginInfo();
    }

    fetchPluginInfo() {
        const state = this.props.location.state;
        if (state && state.pluginId) {
            api.getPluginInfo(state.pluginId).then(res => {
                if (res.code === 0) {
                    const { pluginName, remark, currentVersion, avgScore, countScoreUser, pluginTypes, pluginVersions } = res.data;
                    const versions = pluginVersions[0] ? pluginVersions[0] : {};
                    this.setState({
                        pluginId: state.pluginId,
                        pluginName,
                        remark,
                        avgScore,
                        countScoreUser,
                        pluginType: pluginTypes[0].typeName,
                        version: currentVersion || '0.0.0',
                        versionId: versions.id || '',
                        isPrePublish: versions.isPreDeploy || false,
                        status: this.parseStatus(pluginVersions),
                    });
                }
            });
        } else {
            this.props.history.push({ pathname: '/dashboard/plugin/developedbyme' });
        }
    }

    parseStatus(pluginVersions) {
        const versions = pluginVersions[0];
        if (!versions) {
            // 尚未发布
            return 0;
        }
        const auditStatus = versions.auditStatus;
        const buildStatus = versions.auditStatus;
        if (auditStatus === 1) {
            // 审核中
            return 1;
        }
        if (auditStatus === 2) {
            if (buildStatus === 1) {
                // 审核中(其实是构建中)
                return 1;
            }
            if (buildStatus === 2) {
                // 发布成功
                return 3;
            }
            if (buildStatus === 3) {
                // 构建失败
                return 4;
            }
        }
        if (auditStatus === 3) {
            // 审核失败
            return 2;
        }
    }

    handleTab = (tab) => {
        this.setState({ tab });
    }

    handlePluginName = (event) => {
        this.setState({ newPluginName: event.target.value });
    }

    handleRemark = (event) => {
        this.setState({ newRemark: event.target.value });
    }

    handleCancelPrePublish = () => {
        const { versionId } = this.state;
        api.cancelPrePublish({ versionId }).then(res => {
            if (res.code === 0) {
                this.fetchPluginInfo();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleSave = () => {}
}

export default Management;
