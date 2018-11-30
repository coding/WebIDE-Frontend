import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './create.css';

import Inbox from '../../../share/inbox';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import config from '../../../utils/config';

class Create extends Component {
    state = {
        created: false,
        types: [],
        PluginName: '',
        repoName: '',
        typeId: 0,
        remark: '',
    }

    render() {
        const { types, pluginName, repoName, typeId, remark } = this.state;
        const { canCreate, wsLimit } = this.props;
        const disabled = !canCreate || !pluginName || (pluginName.length > 255) || !repoName || !typeId || !remark || (remark.length > 255);
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
                            {types.map(t => <Type key={t.id} {...t} on={typeId === t.id} handler={this.handleType} />)}
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
                        {!canCreate && (
                            <div className="can-not-create-ws-tip">
                                <i className="fa fa-exclamation-circle"></i>
                                {i18n('ws.limitTip', { limit: wsLimit })}
                            </div>
                        )}
                        <button className="com-button primary" disabled={disabled} onClick={this.handleCreate}>{i18n('global.create')}</button>
                        <button className="com-button default" onClick={this.handleBack}>{i18n('global.back')}</button>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        api.getPluginTypes().then(res => {
            if (res.code === 0) {
                this.setState({ types: res.data });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    componentDidUpdate() {
        const { created, repoName } = this.state;
        const { history, globalKey } = this.props;
        // 第一次打开工作空间加上 open=README.md
        if (created) {
            // 异步请求代码内打开新页面会被浏览器拦截，所以在这里打开新页面
            const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${globalKey}&projectName=${repoName}&open=README.md`;
            window.open(wsHref);
            history.push({ pathname: '/dashboard/workspace' });
        }
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
            this.setState({ typeId: 0 });
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
        const { showLoading, hideLoading } = this.props;
        showLoading({ message: i18n('plugin.creatingPlugin') });
        // pluginTemplateId 是固定的
        api.createPlugin({
            ...config.hardware,
            pluginName,
            repoName,
            typeId,
            pluginTemplateId: 8,
            remark,
        }).then(res => {
            hideLoading();
            if (res.code === 0) {
                this.setState({ created: true });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg });
            }
        }).catch(err => {
            hideLoading();
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const Type = ({ id, typeName, on, handler }) => {
    return (
        <div className={`type${on ? ' on' : ''}`} onClick={() => handler(id)}>{typeName}</div>
    );
}

const mapState = (state) => {
    return {
        globalKey: state.userState.global_key,
        canCreate: state.wsState.canCreate,
        wsLimit: state.wsState.wsLimit,
    }
}

const mapDispatch = (dispatch) => {
    return {
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(withRouter(Create));
