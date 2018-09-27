import React, { Component } from 'react';
import { connect } from 'react-redux';

import './workspace.css';

import i18n from '../../utils/i18n';
import api from '../../api';
import Card from './card';
import New from './new';
import PlaceholderCard from '../../share/placeholderCard';

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
                    {
                        workspaces.length
                        ? workspaces.map(ws => <Card key={ws.spaceKey} {...ws}
                            switchMaskToOn={switchMaskToOn}
                            switchMaskToOff={switchMaskToOff}
                            handleFetch={this.handleFetch} />
                        )
                        : <PlaceholderCard style={{ width: 340, height: 80 }} />
                    }
                    <New />
                </div>
                <div className="caption">
                    <div>{i18n('global.recentdeleted')} ({workspacesInvalid.length})</div>
                    <div className="tip">{i18n('global.deleteProjectTip')}</div>
                </div>
                <div className="deleted">
                    {
                        workspacesInvalid.length
                        ? workspacesInvalid.map(ws => <Card key={ws.spaceKey} {...ws}
                            switchMaskToOn={switchMaskToOn}
                            switchMaskToOff={switchMaskToOff}
                            handleFetch={this.handleFetch} />
                        )
                        : <PlaceholderCard style={{ width: 340, height: 80 }} />
                    }
                </div>
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
            }
        });
        api.getWorkspaceInvalid().then(res => {
            if (res && res.length) {
                const invalid = [];
                for (let i = 0; i < res.length; i++) {
                    const item = res[i];
                    const ws = {};
                    ws.spaceKey = item.spaceKey;
                    ws.projectIconUrl = item.project.iconUrl;
                    ws.ownerName = item.owner.name;
                    ws.projectName = item.project.name;
                    ws.lastModifiedDate = item.lastModifiedDate;
                    ws.workingStatus = item.workingStatus;
                    invalid.push(ws);
                }
                this.setState({ workspacesInvalid: invalid });
            }
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
