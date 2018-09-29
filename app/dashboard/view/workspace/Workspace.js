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
        workspaces: [],
        workspacesInvalid: [],
    }

    render() {
        const { workspaces, workspacesInvalid } = this.state;
        const { switchMaskToOn, switchMaskToOff } = this.props;
        return (
            <div className="dash-workspace">
                <div className="created">
                    <New />
                    {workspaces.map(ws => <Card key={ws.spaceKey} {...ws}
                        switchMaskToOn={switchMaskToOn}
                        switchMaskToOff={switchMaskToOff}
                        handleFetch={this.handleFetch} />
                    )}
                </div>
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
                this.setState({ workspaces: list });
                this.props.storeWorkspaceCount(list.length);
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to fetch workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
        api.getWorkspaceInvalid().then(res => {
            if (res && res.length) {
                const invalid = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.project.iconUrl;
                    ws.ownerName = item.project.ownerName;
                    ws.projectName = item.project.name;
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    invalid.push(ws);
                }
                this.setState({ workspacesInvalid: invalid });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to fetch deleted workspaceList' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapDispatch = (dispatch) => {
    return {
        switchMaskToOn: (payload) => dispatch({ type: 'SWITCH_MASK_TO_ON', payload }),
        switchMaskToOff: () => dispatch({ type: 'SWITCH_MASK_TO_OFF' }),
        storeWorkspaceCount: (payload) => dispatch({ type: 'STORE_WORKSPACE_COUNT', payload }),
    }
}

export default connect(null, mapDispatch)(Workspace);
