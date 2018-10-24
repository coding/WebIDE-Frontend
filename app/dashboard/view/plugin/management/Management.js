import React, { Component } from 'react';

import './management.css';

import Publish from '../publish';
import Star from '../../../share/star';
import Inbox from '../../../share/inbox';
import api from '../../../api';
import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';

// 审核状态表
const statusMap = {
    "1": "plugin.statusDev",
    "2": "plugin.statusAuditPass",
    "3": "plugin.statusAuditFailure",
};

class Management extends Component {
    state = {
        pluginName: '',
        remark: '',
        currentVersion: '3.3.3',
        pluginType: '',
        avgScore: 3,
        countScoreUser: 2327,
        tab: 1,
        newPluginName: '',
        newRemark: '',
        newVersion: '',
    }

    render() {
        const { pluginName, remark, currentVersion, pluginType, avgScore, countScoreUser, tab } = this.state;
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
                        <span>v{currentVersion}</span>
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
                <div className="audit-status">{i18n(statusMap[1])}</div>
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
                {tab === 2 && <Publish version="3.3.3" />}
            </div>
        );
    }

    componentDidMount() {
        const state = this.props.location.state;
        if (state && state.pluginId) {
            api.getPluginInfo(state.pluginId).then(res => {
                if (res.code === 0) {
                    const { pluginName, remark, avgScore, countScoreUser, pluginTypes } = res.data;
                    this.setState({
                        pluginName,
                        remark,
                        avgScore,
                        countScoreUser,
                        pluginType: pluginTypes[0].typeName,
                    });
                }
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

    handleSave = () => {}
}

export default Management;
