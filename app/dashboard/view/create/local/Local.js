import React, { Component } from 'react';

import './local.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import TemplateCard from '../templateCard';
import PlaceholderCard from '../../../share/placeholderCard';
import { notify, NOTIFY_TYPE } from '../../../../components/Notification/actions';

class Local extends Component {
    state = {
        workspaceName: '',
        desc: '',
        templateId: -1,
    }

    render() {
        const { workspaceName, desc, templateId } = this.state;
        const { templates } = this.props;
        return (
            <div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.workspaceName')}*</div>
                    <div className="board-content">
                        <input className="com-input" type="text" spellCheck={false} value={workspaceName} onChange={this.handleWorkspaceName} />
                        <div className="input-tip">{i18n('global.inputTip')}</div>
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.description')}</div>
                    <div className="board-content desc">
                        <textarea className="com-textarea" spellCheck={false} value={desc} onChange={this.handleDescription}></textarea>
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.template')}*</div>
                    <div className="board-content env">
                        {
                            templates.length ? (
                                templates.map(item => <TemplateCard key={item.id} {...item}
                                    templateId={templateId}
                                    handleSeleteTemplate={this.handleSeleteTemplate} />
                                )
                            ) : <PlaceholderCard style={{ width: 260, height: 60 }} />
                        }
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label"></div>
                    <div className="board-content">
                        <button className="com-button primary" disabled={!workspaceName || !templateId} onClick={this.handleCreate}>{i18n('global.create')}</button>
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
        this.setState({
            workspaceName: '',
            desc: '',
            templateId: -1,
        });
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
            desc,
            templateId,
        }
        api.createWorkspaceV2(option).then(res => {
            if (res) {
                this.props.history.push({ pathname: '/dashboard/workspace' });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to create workspace' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

export default Local;
