import React, { Component } from 'react';
import { connect } from 'react-redux';

import './workspace.css';

import Intro from './intro';
import Game from './game';
import Card from './card';
import NewWs from './newWS';
import NewPlugin from './newPlugin';

import api from '../../api';
import i18n from '../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Workspace extends Component {
    state = {
        showWelcome: false,
        workspaces: [],
        workspacesCollaborative: [],
        workspacesInvalid: [],
        opendSpaceKey: '',
    }
    interval = null;

    render() {
        const { showWelcome, workspaces, workspacesCollaborative, workspacesInvalid, opendSpaceKey } = this.state;
        const { globalKey, wsLimit, hasWSOpend, showMask, hideMask } = this.props;
        return (
            <div className="dash-workspace">
                {showWelcome && <Intro handler={this.handleWelcome} />}
                <Game />
                <div className="card-box">
                    <NewWs />
                    <NewPlugin />
                </div>
                {workspaces.length > 0 && (
                    <div className="created">
                        <div className="caption">
                            <div className="title">{i18n('ws.myWorkspace')} ({workspaces.length})</div>
                            <div className="tip">
                                {i18n('ws.wsTip', { limit: wsLimit })}
                                <a href="https://dev.tencent.com/help/cloud-studio/workspace-introduction" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                            </div>
                        </div>
                        <div className="card-box">
                            {
                                workspaces.map(ws => <Card key={ws.spaceKey} {...ws}
                                    globalKey={globalKey}
                                    hasWSOpend={hasWSOpend}
                                    opendSpaceKey={opendSpaceKey}
                                    showMask={showMask}
                                    hideMask={hideMask}
                                    handleFetch={this.handleFetch} />
                                )
                            }
                        </div>
                    </div>
                )}
                {workspacesCollaborative.length > 0 && (
                    <div className="collaborate">
                        <div className="caption">
                            <div>{i18n('ws.invitedWorkspace')} ({workspacesCollaborative.length})</div>
                            <div className="tip">{i18n('ws.invitedWorkspaceTip')}</div>
                        </div>
                        <div className="card-box">
                            {
                                workspacesCollaborative.map(ws => <Card key={ws.spaceKey} {...ws}
                                    globalKey={globalKey}
                                    hasWSOpend={hasWSOpend}
                                    opendSpaceKey={opendSpaceKey}
                                    showMask={showMask}
                                    hideMask={hideMask}
                                    handleFetch={this.handleFetch} />
                                )
                            }
                        </div>
                    </div>
                )}
                {workspacesInvalid.length > 0 && (
                    <div className="deleted">
                        <div className="caption">
                            <div>{i18n('global.recentdeleted')} ({workspacesInvalid.length})</div>
                            <div className="tip">{i18n('ws.deletedWSTip')}</div>
                        </div>
                        <div className="card-box">
                            {
                                workspacesInvalid.map(ws => <Card key={ws.spaceKey} {...ws}
                                    showMask={showMask}
                                    hideMask={hideMask}
                                    handleFetch={this.handleFetch} />
                                )
                            }
                        </div>
                    </div>
                )}
            </div>
        );
    }

    componentDidMount() {
        // Intro 组件判断逻辑
        const hideWelcome = localStorage.getItem('cloudstudio-dashboard-hidewelcome');
        if (!hideWelcome) {
            this.setState({ showWelcome: true });
        }
        this.fetchWorkspaceLimit();
        this.handleFetch();
        this.interval = setInterval(() => {
            this.fetchWS();
        }, 10000);
    }

    handleWelcome = () => {
        if (this.state.showWelcome === true) {
            this.setState({ showWelcome: false });
            localStorage.setItem('cloudstudio-dashboard-hidewelcome', true);
        }
    }

    handleFetch = () => {
        this.fetchWS();
        this.fetchInvalidWS();
    }

    fetchWS() {
        const { handleNoWorkspaceOpend, storeWorkspace } = this.props;
        // 初始化
        handleNoWorkspaceOpend();
        Promise.all([api.getWorkspace(), api.getWorkspaceCollaborative()]).then((values) => {
            let wsNor = [];
            let wsCol = [];
            // 自己创建的 workspaces
            if (values[0].code === 0) {
                wsNor = this.handleParse(values[0].data.list);
            } else if (res.code === 401) {
                window.top.postMessage({ path: '/intro' }, '*');
                window.location.href = '/intro';
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: values[0].msg });
            }
            // 协作的 workspaces
            if (Array.isArray(values[1])) {
                wsCol = this.handleParse(values[1]);
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: values[1].msg });
            }
            // 别人邀请自己的 workspaces
            const workspaces = [...wsNor];
            const workspacesCollaborative = [];
            for (let i = 0; i < wsCol.length; i++) {
                const item = wsCol[i];
                if (!wsNor.find(ws => ws.spaceKey === item.spaceKey)) {
                    workspacesCollaborative.push(item);
                }
            }
            // 保存 workspace 数量
            storeWorkspace({ wsCount: workspaces.length });
            this.setState({ workspaces, workspacesCollaborative });
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    handleParse(res) {
        const { globalKey, handleHasWorkspaceOpend } = this.props;
        const array = [];
        for (let i = 0; i < res.length; i++) {
            const item = res[i];
            const ws = {};
            ws.spaceKey = item.spaceKey;
            ws.projectIconUrl = item.projectIconUrl;
            ws.ownerGlobalKey = item.ownerGlobalKey;
            // codingide 是无来源创建的特殊项目名
            ws.ownerName = item.ownerName !== 'codingide' ? item.ownerName : item.ownerGlobalKey;
            // 无远端仓库有一个 workspaceName 字段
            ws.projectName = item.workspaceName && item.workspaceName !== 'default' ? item.workspaceName : item.projectName;
            ws.createDate = item.createDate;
            ws.lastModifiedDate = item.lastModifiedDate;
            ws.workingStatus = item.workingStatus;
            ws.collaborative = item.collaborative;
            array.push(ws);
            if (item.workingStatus === 'Online') {
                // 自己邀请别人算一个已打开的 workspaces，别人邀请自己不算
                if (item.collaborative === true) {
                    if (ws.ownerName === globalKey) {
                        this.setState({ opendSpaceKey: ws.spaceKey });
                        handleHasWorkspaceOpend();
                    }
                } else {
                    this.setState({ opendSpaceKey: ws.spaceKey });
                    handleHasWorkspaceOpend();
                }
            }
        }
        return array;
    }

    fetchInvalidWS() {
        api.getWorkspaceInvalid().then(res => {
            if (Array.isArray(res)) {
                const workspacesInvalid = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.project.iconUrl;
                    // codingide 是无来源创建的特殊项目名
                    ws.ownerName = item.project.ownerName !== 'codingide' ? item.project.ownerName : item.owner.globalKey;
                    // 无远端仓库有一个 workspaceName 字段
                    ws.projectName = item.workspaceName && item.workspaceName !== 'default' ? item.workspaceName : item.project.name;
                    ws.deleteTime = item.deleteTime || item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    workspacesInvalid.push(ws);
                }
                this.setState({ workspacesInvalid });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to fetch deleted workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    fetchWorkspaceLimit() {
        const { storeWorkspace } = this.props;
        api.getWorkspaceLimit().then(res => {
            if (res.code === 0) {
                storeWorkspace({ wsLimit: res.data.workspace });
            }
        });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
}

const mapState = (state) => {
    return {
        globalKey: state.userState.global_key,
        wsLimit: state.wsState.wsLimit,
        hasWSOpend: state.hasWorkspaceOpend,
    };
}

const mapDispatch = (dispatch) => {
    return {
        showMask: (payload) => dispatch({ type: 'SWITCH_MASK_TO_ON', payload }),
        hideMask: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
        storeWorkspace: (payload) => dispatch({ type: 'STORE_WORKSPACE', payload }),
        handleHasWorkspaceOpend: () => dispatch({ type: 'HAS_WORKSPACE_OPEND' }),
        handleNoWorkspaceOpend: () => dispatch({ type: 'NO_WORKSPACE_OPEND' }),
    }
}

export default connect(mapState, mapDispatch)(Workspace);
