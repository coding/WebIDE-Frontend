import React, { Component } from 'react';
import { connect } from 'react-redux';

import './setting.css';

import Modify from '../modify';
import PrePublish from '../prePublish';
import Publish from '../publish';
import History from '../history';
import Star from '../../../share/star';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import kilo from '../../../utils/kilo';
import config from '../../../utils/config';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import parseStatus from './status';

class Setting extends Component {
    state = {
        createdBy: '',
        pluginId: '',
        pluginName: '',
        remark: '',
        historyVersions: [],
        version: '0.0.0',
        versionId: '',
        pluginType: '',
        avgScore: 0,
        countScoreUser: 0,
        repoName: '',
        repoUrl: '',
        status: 0,
        hasPrePublish: false,
        preVersionId: '',
        isPrePublishBuilding: false,
        auditRemark: '',
        tab: 1,
    }
    timer = null

    render() {
        const {
            createdBy,
            pluginId,
            pluginName,
            remark,
            historyVersions,
            version,
            auditRemark,
            pluginType,
            avgScore,
            countScoreUser,
            status,
            repoUrl,
            repoName,
            tab,
        } = this.state;
        const repoHref = `${config.devOrigin}/u/${createdBy}/p/${repoUrl.split('/').pop().split('.').join('/')}`;
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${pluginId}` : `${config.studioOrigin}/plugins/detail/${pluginId}`;
        const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${createdBy}&projectName=${repoName}`;
        return (
            <div className="dash-setmyplugin">
                <div className="top">
                    {
                        status === 5 ? (
                            <a className="plugin-name" href={marketHref} target="_blank" rel="noopener noreferrer">{pluginName}</a>
                        ) : <div className="plugin-name">{pluginName}</div>
                    }
                    <div>
                        <a className="goto" href={repoHref} target="_blank" rel="noopener noreferrer">{i18n('plugin.codeRepo')}</a>
                        <a className="goto" href={wsHref} target="_blank" rel="noopener noreferrer">{i18n('global.workspace')}</a>
                    </div>
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
                        <span className="rate-user-count">({kilo(countScoreUser)} {i18n('plugin.userCount')})</span>
                    </div>
                </div>
                <div className="plugin-status">{i18n(`plugin.status${status}`, { version, reason: auditRemark })}</div>
                {status === 4 && (
                    <div className="recall">
                        {i18n('plugin.beforeRecallAudit')}
                        <span className="click" onClick={this.recallAudit}>&nbsp;{i18n('plugin.recallAudit')}</span>
                    </div>
                )}
                <div className="tab">
                    <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>{i18n('plugin.versionHistory')}</div>
                    <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>{i18n('plugin.prePublish')}</div>
                    <div className={`tab-item${tab === 3 ? ' on' : ''}`} onClick={() => this.handleTab(3)}>{i18n('plugin.officialPublish')}</div>
                    <div className={`tab-item${tab === 4 ? ' on' : ''}`} onClick={() => this.handleTab(4)}>{i18n('plugin.baseSetting')}</div>
                </div>
                {tab === 1 && <History historyVersions={historyVersions} />}
                {tab === 2 && <PrePublish {...this.state} release={this.handleRelease} refresh={this.fetchPluginInfo} />}
                {tab === 3 && <Publish version={version} pluginId={pluginId} status={status} release={this.handleRelease} />}
                {tab === 4 && <Modify pluginId={pluginId} pluginName={pluginName} remark={remark} refresh={this.fetchPluginInfo} />}
            </div>
        );
    }

    componentDidMount() {
        this.fetchPluginInfo();
        this.timer = setInterval(() => {
            this.fetchPluginInfo();
        }, 10000);
    }

    fetchPluginInfo = () => {
        const state = this.props.location.state;
        if (state && state.pluginId) {
            api.getPluginInfo(state.pluginId).then(res => {
                if (res.code === 0) {
                    const { createdBy, pluginName, remark, avgScore, countScoreUser, pluginTypes, pluginVersions, repoName, repoUrl } = res.data;
                    const { historyVersions, version, versionId, status, hasPrePublish, preVersionId, isPrePublishBuilding, auditRemark } = parseStatus(pluginVersions);
                    this.setState({
                        createdBy,
                        pluginId: state.pluginId,
                        pluginName,
                        newPluginName: pluginName,
                        remark,
                        newRemark: remark,
                        avgScore,
                        countScoreUser,
                        pluginType: pluginTypes[0].typeName,
                        repoName,
                        repoUrl,
                        historyVersions,
                        version,
                        versionId,
                        status,
                        hasPrePublish,
                        preVersionId,
                        isPrePublishBuilding,
                        auditRemark,
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

    handleRelease = (option) => {
        const { showLoading, hideLoading } = this.props;
        showLoading({ message: i18n('plugin.publishing') });
        api.publishPlugin(option).then(res => {
            hideLoading();
            if (res.code === 0) {
                this.fetchPluginInfo();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            hideLoading();
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    recallAudit = () => {
        const { versionId } = this.state;
        const { showLoading, hideLoading } = this.props;
        showLoading({ message: i18n('plugin.publishing') });
        api.recallAudit({ pluginVersionId: versionId }).then(res => {
            hideLoading();
            if (res.code === 0) {
                this.fetchPluginInfo();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }
}

const mapDispatch = (dispatch) => {
    return {
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(null, mapDispatch)(Setting);
