import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './local.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import TemplateCard from '../templateCard';
import NoData from '../../../share/noData';
import { notify, NOTIFY_TYPE } from '../../../../components/Notification/actions';

class Local extends Component {
    state = {
        workspaceName: '',
        desc: '',
        templateId: -1,
        isCreating: false,
    }

    render() {
        const { workspaceName, desc, templateId, isCreating } = this.state;
        const { templates, language } = this.props;
        let inputPh, textareaPh;
        if (language === 'zh_CN') {
            inputPh = '填写工作空间名';
            textareaPh = '一句话描述这个工作空间';
        } else {
            inputPh = 'Fill in the workspace name';
            textareaPh = 'Describe this workspace in one sentence';
        }
        return (
            <div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.workspaceName')}*</div>
                    <div className="board-content">
                        <input className="com-input" type="text" spellCheck={false} placeholder={inputPh} value={workspaceName} onChange={this.handleWorkspaceName} />
                        <div className="input-tip">{i18n('global.inputTip')}</div>
                    </div>
                </div>
                {/* <div className="com-board">
                    <div className="board-label">{i18n('global.description')}</div>
                    <div className="board-content desc">
                        <textarea className="com-textarea" spellCheck={false} placeholder={textareaPh} value={desc} onChange={this.handleDescription}></textarea>
                    </div>
                </div> */}
                <div className="com-board">
                    <div className="board-label">{i18n('global.template')}*</div>
                    <div className="board-content env">
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
                    <div className="board-label"></div>
                    <div className="board-content">
                        <button className="com-button primary" disabled={!workspaceName || !templateId} onClick={this.handleCreate}>
                            {isCreating ? i18n('global.creating') : i18n('global.create')}
                        </button>
                        <button className="com-button default" onClick={this.handleCancel}>{i18n('global.cancel')}</button>
                    </div>
                </div>
            </div>
        );
    }

    handleWorkspaceName = (event) => {
        this.setState({ workspaceName: event.target.value });
    }

    handleDescription = (event) => {
        this.setState({ desc: event.target.value });
    }

    handleSeleteTemplate = (templateId) => {
        this.setState({ templateId });
    }

    handleCancel = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { workspaceName, desc, templateId } = this.state;
        const option = {
            cpuLimit: 2,
            memory: 512,
            storage: 2,
            workspaceName,
            ownerName: 'codingide',
            projectName: 'empty-template',
            //desc,
            templateId,
        }
        this.setState({ isCreating: true });
        api.createWorkspaceV2(option).then(res => {
            this.setState({ isCreating: false });
            if (!res.code) {
                this.props.history.push({ pathname: '/dashboard/workspace' });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to create workspace' });
            }
        }).catch(err => {
            this.setState({ isCreating: false });
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapState = (state) => {
    return { language: state.language };
}

export default connect(mapState)(withRouter(Local));
