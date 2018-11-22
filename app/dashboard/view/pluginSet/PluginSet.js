import React, { Component } from 'react';
import { connect } from 'react-redux';

import './pluginSet.css';

import Overview from './overview';
import Modify from './modify';
import PrePublish from './prePublish';
import Publish from './publish';
import History from './history';

import api from '../../api';
import i18n from '../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import parseStatus from './status';

class PluginSet extends Component {
    state = {
        createdBy: '',
        pluginId: this.props.match.params.id,
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
        const { pluginId, pluginName, remark, historyVersions, status, version, hasPrePublish, preStatus, preLog, tab } = this.state;
        const prePublishProps = { hasPrePublish, preStatus, preLog };
        return (
            <div className="dash-pluginset">
                <Overview {...this.state} cancelRelease={this.cancelPrePublish} />
                <div className="tab">
                    <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.handleTab(1)}>{i18n('global.publish')}</div>
                    <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.handleTab(2)}>{i18n('plugin.versionHistory')}</div>
                    <div className={`tab-item${tab === 3 ? ' on' : ''}`} onClick={() => this.handleTab(3)}>{i18n('plugin.pluginInfo')}</div>
                </div>
                {tab === 1 && pluginName && (
                    <div className="panel">
                        <PrePublish {...prePublishProps} release={this.handleRelease} cancelRelease={this.cancelPrePublish} />
                        <Publish version={version} status={status} release={this.handleRelease} />
                    </div>
                )}
                {tab === 2 && pluginName && <History historyVersions={historyVersions} />}
                {tab === 3 && pluginName && <Modify pluginId={pluginId} pluginName={pluginName} remark={remark} refresh={this.fetchPlugin} />}
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
        const { pluginId } = this.state;
        api.getPluginInfo(pluginId).then(res => {
            if (res.code === 0) {
                const { createdBy, pluginName, remark, avgScore, countScoreUser, pluginTypes, pluginVersions, repoName, repoUrl } = res.data;
                const { historyVersions, status, version, versionId, log, auditRemark, hasPrePublish, preStatus, preVersionId, preLog } = parseStatus(pluginVersions);
                this.setState({
                    createdBy,
                    pluginName,
                    remark,
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

    componentWillUnmount() {
        clearTimeout(this.timer);
    }
}

const mapDispatch = (dispatch) => {
    return {
        hideVersionPop: () => dispatch({ type: 'HIDE_VERSION_POP' }),
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(null, mapDispatch)(PluginSet);
