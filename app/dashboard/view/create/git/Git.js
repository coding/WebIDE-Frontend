import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './git.css';

import Inbox from '../../../share/inbox';
import SSH from '../../../share/ssh';
import EnvCard from '../envCard';
import NoData from '../../../share/noData';
import ToolTip from '../../../share/toolTip';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import config from '../../../utils/config';

class Git extends Component {
    state = {
        url: '',
        envId: 'ide-tty',
    }

    render() {
        const { url, envId } = this.state;
        const { canCreate, wsLimit, envs, language } = this.props;
        const disabled = !canCreate || !url || !envId;
        return (
            <div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.repoUrl')}*</div>
                    <div className="board-content repo">
                        <div className="repo-input">
                            <Inbox holder="ws.inputGitUrl" value={url} onChange={this.handleUrl} />
                        </div>
                        <SSH />
                    </div>
                </div>
                <div className="com-board short-padding">
                    <div className="board-label">
                        {i18n('global.env')}
                        *
                        <ToolTip message={i18n('ws.envTip')} placement="left">
                            <i className="fa fa-question-circle"></i>
                        </ToolTip>
                    </div>
                    <div className="board-content negative-margin env">
                        {
                            envs.length ? (
                                envs.map(env => <EnvCard key={env.name} {...env}
                                    language={language}
                                    envId={envId}
                                    handleSeleteEnv={this.handleSeleteEnv} />
                                )
                            ) : <NoData />
                        }
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

    handleUrl = (event) => {
        this.setState({ url: event.target.value });
    }

    handleSeleteEnv = (envId) => {
        this.setState({ envId: envId });
    }

    handleBack = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { url, envId } = this.state;
        const { showLoading, hideLoading } = this.props;
        const option = {
            ...config.hardware,
            source: 'Import',
            //desc,
            url,
            envId,
        }
        showLoading({ message: i18n('ws.creatingWS') });
        api.cloneWorkspace(option).then(res => {
            hideLoading();
            if (res.code === 0) {
                this.props.history.push({ pathname: '/dashboard/workspace' });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to create workspace' });
            }
        }).catch(err => {
            hideLoading();
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapState = (state) => {
    return {
        language: state.language,
        canCreate: state.wsState.canCreate,
        wsLimit: state.wsState.wsLimit,
    };
}

const mapDispatch = (dispatch) => {
    return {
        showLoading: (payload) => dispatch({ type: 'SWITCH_LOADING_TO_ON', payload }),
        hideLoading: () => dispatch({ type: 'SWITCH_LOADING_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(withRouter(Git));
