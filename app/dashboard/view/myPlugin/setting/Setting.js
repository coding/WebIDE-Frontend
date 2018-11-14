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
        pluginType: '',
        avgScore: 0,
        countScoreUser: 0,
        repoName: '',
        repoUrl: '',
        historyVersions: [],
        status: 0,
        version: '0.0.0',
        versionId: '',
        log: '',
        auditRemark: '',
        hasPrePublish: false,
        preStatus: 0,
        preVersionId: '',
        preLog: '',
        tab: 1,
    }
    timer = null

    render() {
        const {
            createdBy,
            pluginId,
            pluginName,
            remark,
            pluginType,
            avgScore,
            countScoreUser,
            repoUrl,
            repoName,
            historyVersions,
            status,
            version,
            auditRemark,
            hasPrePublish,
            preStatus,
            tab,
        } = this.state;
        const repoHref = `${config.devOrigin}/u/${createdBy}/p/${repoUrl.split('/').pop().split('.').join('/')}`;
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${pluginId}` : `${config.studioOrigin}/plugins/detail/${pluginId}`;
        const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${createdBy}&projectName=${repoName}`;
        return (
            <div className="dash-setmyplugin">
                <div className="overview">
                    <div className="top">
                        <div className="name">{pluginName}</div>
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
                    <div className="status">
                        {i18n(`plugin.status${status}`, { version, reason: auditRemark })}
                        {status === 5 && (
                            <span>
                                <a href={marketHref} target="_blank" rel="noopener noreferrer">{i18n('plugin.status5Click')}</a>
                                {i18n('plugin.status5After')}
                            </span>
                        )}
                        {status === 4 && (
                            <span>
                                <span className="click" onClick={this.popForBuildingFail}>{i18n('plugin.status4Click')}</span>
                                {i18n('global.period')}
                            </span>
                        )}
                    </div>
                    {hasPrePublish && preStatus === 2 && (
                        <div className="pre">
                            <i className="fa fa-exclamation-circle"></i>
                            {i18n('plugin.nowPrePublish')}
                            <span className="click" onClick={this.cancelPrePublish}>{i18n('plugin.cancelPrePublish')}</span>
                            {i18n('global.period')}
                        </div>
                    )}
                    <div className="tab">
                        <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>{i18n('plugin.baseSetting')}</div>
                        <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>{i18n('global.publish')}</div>
                        <div className={`tab-item${tab === 3 ? ' on' : ''}`} onClick={() => this.handleTab(3)}>{i18n('plugin.versionHistory')}</div>
                    </div>
                </div>
                {tab === 1 && pluginName && <Modify pluginId={pluginId} pluginName={pluginName} remark={remark} refresh={this.fetchPlugin} />}
                {tab === 2 && (
                    <div className="panel">
                        <PrePublish hasPrePublish={hasPrePublish} preStatus={preStatus} release={this.handleRelease} cancelRelease={this.cancelPrePublish} refresh={this.fetchPlugin} />
                        <Publish version={version} status={status} release={this.handleRelease} />
                    </div>
                )}
                {tab === 3 && <History historyVersions={historyVersions} />}
            </div>
        );
    }

    componentDidMount() {
        this.fetchPlugin();
        this.timer = setInterval(() => {
            this.fetchPlugin();
        }, 10000);
    }

    fetchPlugin = () => {
        const state = this.props.location.state;
        if (state && state.pluginId) {
            api.getPluginInfo(state.pluginId).then(res => {
                if (res.code === 0) {
                    const { createdBy, pluginName, remark, avgScore, countScoreUser, pluginTypes, pluginVersions, repoName, repoUrl } = res.data;
                    const { historyVersions, status, version, versionId, log, auditRemark, hasPrePublish, preStatus, preVersionId, preLog } = parseStatus(pluginVersions);
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
                        status,
                        version,
                        versionId,
                        log,
                        auditRemark,
                        hasPrePublish,
                        preStatus,
                        preVersionId,
                        preLog,
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
        const { pluginId } = this.state;
        const { showLoading, hideLoading } = this.props;
        showLoading({ message: i18n('plugin.publishing') });
        api.publishPlugin({ ...option, pluginId }).then(res => {
            hideLoading();
            if (res.code === 0) {
                this.fetchPlugin();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            hideLoading();
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    cancelPrePublish = () => {
        const { preVersionId } = this.state;
        const { hideVersionPop } = this.props;
        api.cancelPrePublish({ versionId: preVersionId }).then(res => {
            if (res.code === 0) {
                this.fetchPlugin();
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
        hideVersionPop();
    }

    popForBuildingFail = () => {
        this.props.showVersionPop({
            type: 2,
            desc: i18n('plugin.status4Desc', { version: this.state.version }),
            log: this.state.log,
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }
}

const mapDispatch = (dispatch) => {
    return {
        showVersionPop: (payload) => dispatch({ type: 'SHOW_VERSION_POP', payload }),
        hideVersionPop: () => dispatch({ type: 'HIDE_VERSION_POP' }),
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(null, mapDispatch)(Setting);
