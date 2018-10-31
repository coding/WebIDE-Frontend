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
        pluginId: '',
        pluginName: '',
        remark: '',
        historyVersions: [],
        version: '0.0.0',
        versionId: '',
        pluginType: '',
        avgScore: 0,
        countScoreUser: 0,
        spaceKey: '',
        status: 0,
        hasPrePublish: false,
        preVersionId: '',
        tab: 1,
    }

    render() {
        const { pluginId, pluginName, remark, historyVersions, version, pluginType, avgScore, countScoreUser, status, spaceKey, tab } = this.state;
        const href = window === window.top ? `${window.location.origin}/ws/${spaceKey}` : `${config.tencentOrigin}/ws/${spaceKey}`;
        return (
            <div className="dash-setmyplugin">
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
                <div className="plugin-status">{i18n(`plugin.status${status}`, { version })}</div>
                <div className="tab">
                    <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>{i18n('plugin.baseSetting')}</div>
                    <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>{i18n('plugin.prePublish')}</div>
                    <div className={`tab-item${tab === 3 ? ' on' : ''}`} onClick={() => this.handleTab(3)}>{i18n('plugin.officialPublish')}</div>
                    <div className={`tab-item${tab === 4 ? ' on' : ''}`} onClick={() => this.handleTab(4)}>{i18n('plugin.versionHistory')}</div>
                </div>
                {tab === 1 && <Modify pluginId={pluginId} pluginName={pluginName} remark={remark} refresh={this.fetchPluginInfo} />}
                {tab === 2 && <PrePublish {...this.state} release={this.handleRelease} refresh={this.fetchPluginInfo} />}
                {tab === 3 && <Publish version={version} pluginId={pluginId} status={status} release={this.handleRelease} />}
                {tab === 4 && <History historyVersions={historyVersions} />}
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
                    const { historyVersions, version, versionId, status, hasPrePublish, preVersionId } = parseStatus(pluginVersions);
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
                        historyVersions,
                        version,
                        versionId,
                        status,
                        hasPrePublish,
                        preVersionId,
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
        showLoading({ message: i18n('plugin.publishingPlugin') });
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
}

const mapDispatch = (dispatch) => {
    return {
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(null, mapDispatch)(Setting);
