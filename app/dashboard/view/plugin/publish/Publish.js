import React, { Component } from 'react';
import { connect } from 'react-redux';

import './publish.css';

import Inbox from '../../../share/inbox';
import ToolTip from '../../../share/toolTip';
import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Publish extends Component {
    state = {
        v: { major: '', minor: '', patch: '' },
        major: 0,
        minor: 0,
        patch: 0,
        desc: '',
        isTTOn: false,
    }

    render() {
        const { v, major, minor, patch, desc, isTTOn } = this.state;
        // 新版本必须高于老版本
        const oldNum = v.major * 10000 + v.minor * 100 + v.patch;
        const newNum = major * 10000 + minor * 100 + patch;
        const disabled = (newNum <= oldNum) || !desc;
        return (
            <div className="panel">
                <div className="panel-title">
                    <div className="publish-tip">{i18n('plugin.publishTip')}</div>
                </div>
                <div className="com-board">
                    <div className="board-label">
                        {i18n('global.release')}
                        *
                        <a className="version-url" href="https://semver.org/lang/zh-CN/" target="_blank" rel="noopener noreferrer">
                            <i className="fa fa-question-circle"></i>
                        </a>
                    </div>
                    <div className="board-content">
                        <input className="com-input version-number" type="number" min={0} max={99} value={major} onChange={(event) => this.handleVersion(event, 'major')} />
                        <span className="version-dot">.</span>
                        <input className="com-input version-number" type="number" min={0} max={99} value={minor} onChange={(event) => this.handleVersion(event, 'minor')} />
                        <span className="version-dot">.</span>
                        <input className="com-input version-number" type="number" min={0} max={99} value={patch} onChange={(event) => this.handleVersion(event, 'patch')} />
                        <div className="version-tip">{i18n('plugin.versionTip')}</div>
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('plugin.releaseMessage')}*</div>
                    <div className="board-content">
                        <Inbox type="textarea" holder="plugin.inputReleaseMessage" value={desc} onChange={this.handleDesc} />
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label none"></div>
                    <div className="board-content">
                        <div className="prepublish-tip">
                            {i18n('plugin.prePublishTip')}
                            <span className="plugin-publish-tooltip">
                                <i className="fa fa-question-circle" onMouseEnter={this.handleTT} onMouseLeave={this.handleTT}></i>
                                <ToolTip on={isTTOn} message={isTTOn ? i18n('plugin.publishTooltip') : ''} placement="center" />
                            </span>
                        </div>
                        <button className="com-button primary" disabled={disabled} onClick={this.handlePublish}>{i18n('global.publish')}</button>
                        <button className="com-button default" disabled={disabled} onClick={this.handlePrePublish}>{i18n('plugin.prePublish')}</button>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        const arr = this.props.version.split('.');
        const major = Number(arr[0]);
        const minor = Number(arr[1]);
        const patch = Number(arr[2]);
        this.setState({
            v: { major, minor, patch },
            major,
            minor,
            patch,
        });
    }

    handleVersion = (event, which) => {
        const value = Number(event.target.value);
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

    handleDesc = (event) => {
        this.setState({ desc: event.target.value });
    }

    handleTT = () => {
        this.setState(prevState => ({ isTTOn: !prevState.isTTOn }));
    }

    handlePublish = () => {
        this.handlePost(false);
    }

    handlePrePublish = () => {
        this.handlePost(true);
    }

    handlePost(isPreDeploy) {
        const { major, minor, patch, desc } = this.state;
        const { pluginId, fetchInfo, showLoading, hideLoading } = this.props;
        const option = {
            pluginId,
            version: `${major}.${minor}.${patch}`,
            description: desc,
        }
        option.isPreDeploy = isPreDeploy;
        showLoading({ message: i18n('plugin.publishingPlugin') });
        api.publishPlugin(option).then(res => {
            hideLoading();
            if (res.code === 0) {
                fetchInfo();
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

export default connect(null, mapDispatch)(Publish);
