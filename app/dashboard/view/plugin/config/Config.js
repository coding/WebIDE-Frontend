import React, { Component } from 'react';

import './config.css';

import Star from '../../../share/star';
import Inbox from '../../../share/inbox';
import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';

class Config extends Component {
    state = {
        pluginName: 'Git 增强插件',
        remark: '解放路口时尽量发的是看了就看到健身房克鲁赛德付款了的设计费看来大家快来辅导费第三方了会计师的考虑富家大室奋斗开始就分开了第三方卡兰蒂斯附',
        currentVersion: '1.1.0',
        pluginTypeId: 1,
        avgScore: 3,
        countScoreUser: 2327,
        tab: 1,
        newPluginName: '',
        newRemark: '',
        newVersion: '',
        major: 0,
        minor: 0,
        patch: 0,
        versionMessage: '',
    }

    render() {
        const { pluginName, remark, currentVersion, pluginTypeId, avgScore, countScoreUser, tab } = this.state;
        const { newPluginName, newRemark } = this.state;
        const { major, minor, patch, versionMessage } = this.state;
        const disabled = false;
        return (
            <div className="dash-developedbyme-config">
                <div className="top">
                    <div className="plugin-name">{pluginName}</div>
                    <a className="goto" href="" target="_blank" rel="noopener noreferrer">{i18n('ws.gotoWS')}</a>
                </div>
                <div className="desc">{remark}</div>
                <div className="info">
                    <div className="item">
                        <span className="key">{i18n('plugin.currentVersion')}:</span>
                        <span>v{currentVersion}</span>
                    </div>
                    <div className="item">
                        <span className="key">{i18n('global.category')}:</span>
                        <span>{pluginTypeId}</span>
                    </div>
                    <div className="item">
                        <span className="key">{i18n('global.status')}:</span>
                        <span className="review-status">{i18n('global.underReview')}</span>
                    </div>
                    <div className="item">
                        <Star score={avgScore} />
                        <span className="rate-user-count">({kilo(countScoreUser)})</span>
                    </div>
                </div>
                <div className="tab">
                    <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>基本设置</div>
                    <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>发布新版本</div>
                </div>
                {
                    tab === 1 && (
                        <div className="panel">
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
                {
                    tab === 2 && (
                        <div className="panel">
                            <div className="com-board">
                                <div className="board-label">{i18n('plugin.newVersion')}*</div>
                                <div className="board-content">
                                    <input className="com-input version-number" type="number" min={0} value={major} onChange={(event) => this.handleVersion(event, 'major')} />
                                    <span className="version-dot">.</span>
                                    <input className="com-input version-number" type="number" min={0} value={minor} onChange={(event) => this.handleVersion(event, 'minor')} />
                                    <span className="version-dot">.</span>
                                    <input className="com-input version-number" type="number" min={0} value={patch} onChange={(event) => this.handleVersion(event, 'patch')} />
                                </div>
                            </div>
                            <div className="com-board">
                                <div className="board-label">{i18n('plugin.versionMessage')}*</div>
                                <div className="board-content">
                                    <Inbox type="textarea" holder="plugin.inputVersionMessage" value={versionMessage} onChange={this.handleVersionMessage} />
                                </div>
                            </div>
                            <div className="com-board">
                                <div className="board-label none"></div>
                                <div className="board-content">
                                    <button className="com-button primary" disabled={disabled} onClick={this.handlePublish}>{i18n('global.publish')}</button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </div>
        );
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

    handleVersion = (event, which) => {
        const value = event.target.value;
        switch (which) {
            case 'major':
                this.setState({ major: value });
                return;
            case 'minor':
                this.setState({ minor: value });
                return;
            case 'patch':
                this.setState({ patch: value });
                return;
            default:
                return;
        }
    }

    handleVersionMessage = (event) => {
        this.setState({ versionMessage: event.target.value });
    }

    handleSave = () => {}

    handlePublish = () => {}
}

export default Config;
