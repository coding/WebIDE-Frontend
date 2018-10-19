import React, { Component } from 'react';
import { withRouter } from 'react-router';

import './create.css';

import Inbox from '../../../share/inbox';
import i18n from '../../../utils/i18n';
import api from 'dashboard/api/index';

const types = ['Git 工具', '文件操作', '语言增强', '界面 UI', '主题', '小程序', '配色', '信息提示', '腾讯云', 'Markdown 增强', '快捷键', '终端增强', '文件预览'];

class Create extends Component {
    state = {
        PluginName: '',
        repoName: '',
        types: [],
        typeId: '',
        remark: '',
    }

    render() {
        const { pluginName, repoName, typeId, remark } = this.state;
        const disabled = !pluginName || !repoName || !remark;
        return (
            <div className="dash-create-plugin">
                <div className="title">{i18n('plugin.createPlugin')}</div>
                <div className="com-board">
                    <div className="board-label">{i18n('plugin.pluginName')}*</div>
                    <div className="board-content">
                        <Inbox holder="plugin.inputPluginName" value={pluginName} onChange={this.handlePluginName} />
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('plugin.repoName')}*</div>
                    <div className="board-content">
                        <Inbox holder="plugin.inputRepoName" value={repoName} onChange={this.handleRepoName} />
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.category')}*</div>
                    <div className="board-content">
                        <div className="plugin-type">
                            {types.map(type => <Type key={type} type={type} on={type === typeId} handler={this.handleType} />)}
                        </div>
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.desc')}*</div>
                    <div className="board-content">
                        <Inbox type="textarea" holder="plugin.inputPluginDesc" value={remark} onChange={this.handleRemark} />
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label none"></div>
                    <div className="board-content">
                        <button className="com-button primary" disabled={disabled} onClick={this.handleCreate}>{i18n('global.create')}</button>
                        <button className="com-button default" onClick={this.handleBack}>{i18n('global.back')}</button>
                    </div>
                </div>
            </div>
        );
    }

    handlePluginName = (event) => {
        this.setState({ pluginName: event.target.value });
    }

    handleRepoName = (event) => {
        this.setState({ repoName: event.target.value });
    }

    handleType = (type) => {
        const { typeId } = this.state;
        if (typeId !== type) {
            this.setState({ typeId: type });
        } else {
            this.setState({ typeId: '' });
        }
    }

    handleRemark = (event) => {
        this.setState({ remark: event.target.value });
    }

    handleBack = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { pluginName, repoName, typeId, remark } = this.state;
        api.createPlugin({ pluginName, repoName, typeId, remark }).then(res => {});
    }
}

const Type = ({ type, on, handler }) => {
    return (
        <div className={`type${on ? ' on' : ''}`} onClick={() => handler(type)}>{type}</div>
    );
}

export default withRouter(Create);
