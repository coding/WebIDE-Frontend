import React, { Component } from 'react';
import { connect } from 'react-redux';

import './workspace.css';

import i18n from '../../utils/i18n';
import api from '../../api';
import Card from './card';
import New from './new';
import { notify, NOTIFY_TYPE } from '../../../components/Notification/actions';

class Workspace extends Component {
    state = {
        ready: false,
        workspaces: [],
        workspacesInvalid: [],
    }

    render() {
        const { workspaces, workspacesInvalid, ready } = this.state;
        const { hasWorkspaceOpend, switchMaskToOn, switchMaskToOff } = this.props;
        return (
            <div className="dash-workspace">
                <div className="created">
                    {workspaces.length > 0 && <div className="tip">{i18n('global.wsIntro')}</div>}
                    <New />
                    {workspaces.map(ws => <Card key={ws.spaceKey} {...ws}
                        hasWorkspaceOpend={hasWorkspaceOpend}
                        switchMaskToOn={switchMaskToOn}
                        switchMaskToOff={switchMaskToOff}
                        handleFetch={this.handleFetch} />
                    )}
                </div>
                {ready && !workspaces.length && !workspacesInvalid.length && <div className="tip">{i18n('global.noWorkspaceHint')}</div>}
                {
                    workspacesInvalid.length ? (
                        <div className="deleted-container">
                            <div className="caption">
                                <div>{i18n('global.recentdeleted')} ({workspacesInvalid.length})</div>
                                <div className="tip">{i18n('global.deleteProjectTip')}</div>
                            </div>
                            <div className="deleted">
                                {
                                    workspacesInvalid.map(ws => <Card key={ws.spaceKey} {...ws}
                                        switchMaskToOn={switchMaskToOn}
                                        switchMaskToOff={switchMaskToOff}
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
        this.handleFetch();
    }

    handleFetch = () => {
        api.getWorkspace().then(res => {
            if (res.code === 0) {
                const list = res.data.list;
                const workspaces = [];
                for (let i = 0; i < list.length; i++) {
                    const item = list[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.projectIconUrl;
                    ws.ownerName = item.userName;
                    // 无远端仓库有一个 workspaceName 字段
                    // ws.projectName = item.workspaceName === 'default' ? item.projectName : item.workspaceName;
                    ws.projectName = item.workspaceName && item.workspaceName !== 'default' ? item.workspaceName : item.projectName
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    workspaces.push(ws);
                    if (item.workingStatus === 'Online') {
                        this.props.handleWorkspaceOpend();
                    }
                }
                this.setState({ workspaces, ready: true });
                this.props.storeWorkspaceCount(workspaces.length);
            } else {
                this.setState({ ready: true });
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to fetch workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
        api.getWorkspaceInvalid().then(res => {
            if (Array.isArray(res)) {
                const workspacesInvalid = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.project.iconUrl;
                    ws.ownerName = item.project.ownerName;
                    ws.projectName = item.project.name;
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    workspacesInvalid.push(ws);
                }
                this.setState({ workspacesInvalid });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to fetch deleted workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapState = (state) => {
    return { hasWorkspaceOpend: state.hasWorkspaceOpend };
}

const mapDispatch = (dispatch) => {
    return {
        switchMaskToOn: (payload) => dispatch({ type: 'SWITCH_MASK_TO_ON', payload }),
        switchMaskToOff: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
        storeWorkspaceCount: (payload) => dispatch({ type: 'STORE_WORKSPACE_COUNT', payload }),
        handleWorkspaceOpend: () => dispatch({ type: 'HAS_WORKSPACE_OPEND' }),
    }
}

export default connect(mapState, mapDispatch)(Workspace);
