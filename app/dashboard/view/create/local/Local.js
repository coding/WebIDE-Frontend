import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './local.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import Inbox from '../../../share/inbox';
import TemplateCard from '../templateCard';
import NoData from '../../../share/noData';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import config from '../../../utils/config';

class Local extends Component {
    state = {
        workspaceName: '',
        templateId: -1,
    }

    render() {
        const { workspaceName, templateId } = this.state;
        const { canCreate, wsLimit, templates } = this.props;
        const disabled = !canCreate || !workspaceName || !templateId;
        return (
            <div>
                <div className="com-board">
                    <div className="board-label">{i18n('ws.workspaceName')}*</div>
                    <div className="board-content">
                        <Inbox holder="ws.inputWSName" value={workspaceName} onChange={this.handleWorkspaceName} />
                        <div className="input-tip">{i18n('global.inputTip')}</div>
                    </div>
                </div>
                <div className="com-board short-padding">
                    <div className="board-label">{i18n('global.template')}*</div>
                    <div className="board-content negative-margin env">
                        {
                            templates.length ? (
                                templates.map(item => <TemplateCard key={item.id} {...item}
                                    templateId={templateId}
                                    handleSeleteTemplate={this.handleSeleteTemplate} />
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

    handleWorkspaceName = (event) => {
        this.setState({ workspaceName: event.target.value });
    }

    handleSeleteTemplate = (templateId) => {
        this.setState({ templateId });
    }

    handleBack = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { workspaceName, templateId } = this.state;
        const { showLoading, hideLoading } = this.props;
        const option = {
            ...config.hardware,
            workspaceName,
            ownerName: 'codingide',
            projectName: 'empty-template',
            //desc,
            templateId,
        }
        showLoading({ message: i18n('ws.creatingWS') });
        api.createWorkspaceV2(option).then(res => {
            hideLoading();
            if (!res.code) {
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

export default connect(mapState, mapDispatch)(withRouter(Local));
