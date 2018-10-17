import React, { Component } from 'react';
import { connect } from 'react-redux';

import './workspace.css';

import i18n from '../../utils/i18n';
import api from '../../api';
import Intro from './intro';
import Card from './card';
import New from './new';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';

class Workspace extends Component {
    state = {
        showWelcome: false,
        workspaces: [],
        workspacesInvalid: [],
        opendSpaceKey: '',
    }
    interval = null;

    render() {
        const { showWelcome, workspaces, workspacesInvalid, opendSpaceKey } = this.state;
        const { wsLimit, hasWorkspaceOpend, showMask, hideMask } = this.props;
        return (
            <div className="dash-workspace">
                {showWelcome && <Intro handler={this.handleWelcome} />}
                <div className="created">
                    <div className="tip">
                        {i18n('ws.wsTip', { limit: wsLimit })}
                        <a href="https://dev.tencent.com/help/cloud-studio/about-new-cloud-studio#i" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                    </div>
                    <div className="container">
                        <New />
                        {
                            workspaces.map(ws => <Card key={ws.spaceKey} {...ws}
                                hasWorkspaceOpend={hasWorkspaceOpend}
                                opendSpaceKey={opendSpaceKey}
                                showMask={showMask}
                                hideMask={hideMask}
                                handleFetch={this.handleFetch} />
                            )
                        }
                    </div>
                </div>
                {
                    workspacesInvalid.length ? (
                        <div className="deleted">
                            <div className="caption">
                                <div>{i18n('global.recentdeleted')} ({workspacesInvalid.length})</div>
                                <div className="tip">{i18n('ws.deletedWSTip')}</div>
                            </div>
                            <div className="container">
                                {
                                    workspacesInvalid.map(ws => <Card key={ws.spaceKey} {...ws}
                                        showMask={showMask}
                                        hideMask={hideMask}
                                        handleFetch={this.handleFetch} />
                                    )
                                }
                            </div>
                        </div>
                    ) : null
                }
            </div>
        );
    }

    componentDidMount() {
        // Intro 组件判断逻辑
        const hideWelcome = localStorage.getItem('cloudstudio-dashboard-hidewelcome');
        if (!hideWelcome) {
            this.setState({ showWelcome: true });
        }
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
        const { handleNoWorkspaceOpend, handleHasWorkspaceOpend, storeWorkspace } = this.props;
        // 初始化
        handleNoWorkspaceOpend();
        api.getWorkspace().then(res => {
            if (res.code === 0) {
                const list = res.data.list;
                const array = [];
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.projectIconUrl;
                    // codingide 是无来源创建的特殊项目名
                    ws.ownerName = item.ownerName !== 'codingide' ? item.ownerName : item.ownerGlobalKey;
                    // 无远端仓库有一个 workspaceName 字段
                    ws.projectName = item.workspaceName && item.workspaceName !== 'default' ? item.workspaceName : item.projectName;
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    ws.collaborative = item.collaborative;
                    array.push(ws);
                    if (item.workingStatus === 'Online') {
                        this.setState({ opendSpaceKey: ws.spaceKey });
                        handleHasWorkspaceOpend();
                    }
                }
                this.setState({ workspaces: array });
                storeWorkspace({ ws: array, wsCount: array.length });
            } else if (res.code === 401) {
                window.top.postMessage({ path: '/intro' }, '*');
                window.location.href = '/intro';
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to fetch workspaceList' });
            }
            // 获取协作的工作空间
            this.fetchCollaborativeWS();
        }).catch(err => {
            console.log(res);
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }

    fetchCollaborativeWS() {
        const { workspaces } = this.state;
        const { handleNoWorkspaceOpend, handleHasWorkspaceOpend, storeWorkspace } = this.props;
        // 初始化
        handleNoWorkspaceOpend();
        api.getWorkspaceCollaborative().then(res => {
            if (Array.isArray(res)) {
                const array = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.projectIconUrl;
                    // codingide 是无来源创建的特殊项目名
                    ws.ownerName = item.ownerName !== 'codingide' ? item.ownerName : item.ownerGlobalKey;
                    // 无远端仓库有一个 workspaceName 字段
                    ws.projectName = item.workspaceName && item.workspaceName !== 'default' ? item.workspaceName : item.projectName;
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    ws.collaborative = item.collaborative;
                    array.push(ws);
                    if (item.workingStatus === 'Online') {
                        this.setState({ opendSpaceKey: ws.spaceKey });
                        handleHasWorkspaceOpend();
                    }
                }
                for (let i = 0; i < array.length; i++) {
                    const item = array[i];
                    if (!workspaces.find(ws => ws.spaceKey === item.spaceKey)) {
                        workspaces.push(item);
                    }
                }
                this.setState({ workspaces });
                storeWorkspace({ ws: workspaces, wsCount: workspaces.length });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to fetch collaborative workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
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
                    ws.lastModifiedDate = item.lastModifiedDate;
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

    componentWillUnmount() {
        clearInterval(this.interval);
    }
}

const mapState = (state) => {
    return {
        wsLimit: state.wsState.wsLimit,
        hasWorkspaceOpend: state.hasWorkspaceOpend,
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
