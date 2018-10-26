import React, { Component } from 'react';

import './setting.css';

import Publish from '../publish';
import Star from '../../../share/star';
import Inbox from '../../../share/inbox';
import api from '../../../api';
import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';
import { tencentOrigin } from '../../../utils/config';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import parseStatus from './status';

class Setting extends Component {
    state = {
        pluginId: '',
        pluginName: '',
        remark: '',
        version: '0.0.0',
        versionId: '',
        pluginType: '',
        avgScore: 0,
        countScoreUser: 0,
        spaceKey: '',
        status: 0,
        tab: 1,
        newPluginName: '',
        newRemark: '',
    }

    render() {
        const { pluginId, pluginName, remark, version, pluginType, avgScore, countScoreUser, status, spaceKey } = this.state;
        const { tab, newPluginName, newRemark } = this.state;
        const disabled = !newPluginName || !newRemark;
        const href = window === window.top ? `${window.location.origin}/ws/${spaceKey}` : `${tencentOrigin}/ws/${spaceKey}`;
        return (
            <div className="dash-developedbyme-setting">
                <div className="top">
                    <div className="plugin-name">{pluginName}</div>
                    <a className="goto" href={href} target="_blank" rel="noopener noreferrer">{i18n('ws.gotoWS')}</a>
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
                {
                    status !== 5 ? (
                        <div className="plugin-status">{i18n(`plugin.status${status}`, { version })}</div>
                    ) : (
                        <div className="plugin-status">
                            {i18n('plugin.hasPrePublish')}
                            <span className="click" onClick={this.handleCancelPrePublish}>{i18n('plugin.cancelPublish')}</span>
                        </div>
                    )
                }
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
                                    <button className="com-button primary" disabled={disabled} onClick={this.handleSave}>{i18n('global.modify')}</button>
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

    fetchPluginInfo = () => {
        const state = this.props.location.state;
        if (state && state.pluginId) {
            api.getPluginInfo(state.pluginId).then(res => {
                if (res.code === 0) {
                    const { pluginName, remark, avgScore, countScoreUser, pluginTypes, pluginVersions, spaceKey } = res.data;
                    const { version, versionId, status } = parseStatus(pluginVersions);
                    this.setState({
                        pluginId: state.pluginId,
                        pluginName,
                        newPluginName: pluginName,
                        remark,
                        newRemark: remark,
                        avgScore,
                        countScoreUser,
                        pluginType: pluginTypes[0].typeName,
                        spaceKey,
                        version,
                        versionId,
                        status,
                    });
                } else {
                    notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
                }
            }).catch(err => {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
            });
        } else {
            this.props.history.push({ pathname: '/dashboard/plugin/developedbyme' });
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

    handleSave = () => {
        const { pluginId, newPluginName, newRemark } = this.state;
        api.modifyPluginInfo({
            pluginId,
            pluginName: newPluginName,
            remark: newRemark,
        }).then(res => {
            if (res && res.code === 0) {
                this.fetchPluginInfo();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

export default Setting;
