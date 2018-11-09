import React, { Component } from 'react';

import './publish.css';

import Inbox from '../../../share/inbox';

import i18n from '../../../utils/i18n';

const pushHref = 'https://studio.dev.tencent.com/plugins-docs/#推送到远端仓库';

class Publish extends Component {
    state = {
        v: { major: '', minor: '', patch: '' },
        major: 0,
        minor: 0,
        patch: 0,
        desc: '',
    }

    render() {
        const { status } = this.props;
        // 审核中无法发布
        if (status === 1) {
            return <div className="cannot-publish">{i18n('plugin.cannotPublishForAuditing')}</div>;
        }
        // 构建中无法发布
        if (status === 3) {
            return <div className="cannot-publish">{i18n('plugin.cannotPublishForBuilding')}</div>;
        }
        const { v, major, minor, patch, desc } = this.state;
        // 新版本必须高于老版本
        const oldNum = v.major * 10000 + v.minor * 100 + v.patch;
        const newNum = major * 10000 + minor * 100 + patch;
        const disabled = (newNum <= oldNum) || !desc || desc.length > 255;
        return (
            <div className="panel">
                <div className="panel-title"></div>
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
                    <div className="board-label">{i18n('plugin.releaseNote')}*</div>
                    <div className="board-content">
                        <Inbox type="textarea" holder="plugin.inputReleaseNote" value={desc} onChange={this.handleDesc} />
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label none"></div>
                    <div className="board-content">
                        <div className="push-tip">
                            <i className="fa fa-exclamation-circle"></i>
                            {i18n('plugin.publishTip')}
                            <a href={pushHref} target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                        </div>
                        <button className="com-button primary" disabled={disabled} onClick={this.handlePublish}>{i18n('global.publish')}</button>
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

    handlePublish = () => {
        const { major, minor, patch, desc } = this.state;
        const { pluginId, release } = this.props;
        // 预发布与发布是同一个接口，isPreDeploy字段不同
        const option = {
            pluginId,
            version: `${major}.${minor}.${patch}`,
            description: desc,
            isPreDeploy: false,
        }
        release(option);
    }
}

export default Publish;
