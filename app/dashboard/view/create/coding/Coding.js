import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './coding.css';

import Inbox from '../../../share/inbox';
import ProjectCard from '../projectCard';
import TemplateCard from '../templateCard';
import EnvCard from '../envCard';
import NoData from '../../../share/noData';
import ToolTip from '../../../share/toolTip';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import config from '../../../utils/config';

class Coding extends Component {
    state = {
        type: 1,
        ownerName: '',
        projectName: '',
        templateId: -1,
        envId: 'ide-tty',
        filter: '',
        isSync: false,
    };

    render() {
        const { type, ownerName, projectName, templateId, envId, filter, isSync } = this.state;
        let { canCreate, wsLimit, projects, templates, envs, language } = this.props;
        // 搜索
        if (filter) {
            projects = projects.filter(item => item.ownerName.toLowerCase().includes(filter) || item.name.toLowerCase().includes(filter));
        }
        const disabled = !canCreate || (type === 1 ? (!projectName || !envId) : (!projectName || !templateId));
        return (
            <div>
                {type === 2 && (
                    <div className="com-board">
                        <div className="board-label">{i18n('ws.projectName')}*</div>
                        <div className="board-content">
                            <Inbox holder="ws.inputProjectName" value={projectName} onChange={this.handleProjectName} />
                            <div className="input-tip">{i18n('global.inputTip')}</div>
                        </div>
                    </div>
                )}
                <div className="com-board">
                    <div className="board-label">{type === 1 ? i18n('global.project') : i18n('global.template')}*</div>
                    <div className="board-content project">
                        <div className="project-head">
                            <div className="project-head-left">
                                <div className={`item${type === 1 ? ' active' : ''}`} onClick={() => this.handleType(1)}>{i18n('ws.existingProject')}</div>
                                <div className={`item${type === 2 ? ' active' : ''}`} onClick={() => this.handleType(2)}>{i18n('ws.templateProject')}</div>
                            </div>
                            {type === 1 && (
                                <div className="project-head-right">
                                    <Inbox holder="global.search" value={filter} onChange={this.handleFilter} />
                                    <div className="sync" onClick={this.handleSync}>
                                        <ToolTip message={i18n('ws.syncTip')} placement="right">
                                            <i className={`fa fa-refresh${!isSync ? '' : ' fa-spin'}`}></i>
                                            {!isSync ? i18n('global.sync') : i18n('global.syncing')}
                                        </ToolTip>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="project-body">
                            {
                                type === 1 ? (
                                    projects.length ? (
                                        projects.map(item => <ProjectCard key={item.id} {...item}
                                            selected={{ seletedOwnerName: ownerName, seletedProjectName: projectName }}
                                            filter={filter}
                                            handleSeleteProject={this.handleSeleteProject} />
                                        )
                                    ) : <div className="noproject">{i18n('ws.noProject')}</div>
                                ) : (
                                    templates.length ? (
                                        templates.map(item => <TemplateCard key={item.id} {...item}
                                            templateId={templateId}
                                            handleSeleteTemplate={this.handleSeleteTemplate} />
                                        )
                                    ) : <NoData />
                                )
                            }
                        </div>
                    </div>
                </div>
                {type === 1 && (
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
                )}
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
        this.handleSync();
    }

    handleType = (type) => {
        this.setState({
            type,
            ownerName: '',
            projectName: '',
            templateId: -1,
            envId: 'ide-tty',
        });
    }

    handleFilter = (event) => {
        this.setState({ filter: event.target.value.toLowerCase() });
    }

    handleSync = () => {
        this.setState({ isSync: true });
        api.syncProject().then(res => {
            this.setState({ isSync: false });
            this.props.fetchCodingProject();
        }).catch(err => {
            this.setState({ isSync: false });
            this.props.fetchCodingProject();
        });
    }

    handleProjectName = (event) => {
        this.setState({ projectName: event.target.value });
    }

    handleSeleteProject = ({ ownerName, projectName }) => {
        this.setState({ ownerName, projectName });
    }

    handleSeleteTemplate = (templateId) => {
        this.setState({ templateId });
    }

    handleSeleteEnv = (envId) => {
        this.setState({ envId: envId });
    }

    handleBack = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { type, ownerName, projectName, envId, templateId } = this.state;
        const { globalKey, showLoading, hideLoading } = this.props;
        const workspaceOption = {
            ...config.hardware,
            source: 'Coding',
            //desc,
            ownerName: ownerName || globalKey,
            projectName,
        };
        showLoading({ message: i18n('ws.creatingWS') });
        if (type === 1) {
            workspaceOption.envId = envId;
            // 查询该 project 是否创建过 workspace
            api.findProject({ ownerName, projectName }).then(res => {
                if (!res.data) {
                    this.handleCreateWorkspace(workspaceOption);
                } else {
                    hideLoading();
                    notify({ notifyType: NOTIFY_TYPE.ERROR, message: i18n('ws.wsExisted', { ws: res.data }) });
                }
            });
        } else {
            workspaceOption.templateId = templateId;
            const projectOption = {
                type: 2,
                gitEnabled: true,
                gitReadmeEnabled: false,
                gitIgnore: 'no',
                gitLicense: 'no',
                vcsType: 'git',
                name: projectName,
                //desc,
                joinTeam: false,
                teamGK: globalKey,
            };
            // 模板方式先创建项目
            api.createProject(projectOption).then(res => {
                if (res.code === 0) {
                    this.handleCreateWorkspace(workspaceOption);
                } else {
                    hideLoading();
                    let message;
                    if (res.msg) {
                        const msg = res.msg;
                        if (typeof msg === 'object') {
                            message = msg[Object.keys(msg)[0]];
                        } else {
                            message = res.msg;
                        }
                    } else {
                        message = 'Failed to create project';
                    }
                    notify({ notifyType: NOTIFY_TYPE.ERROR, message });
                }
            }).catch(err => {
                hideLoading();
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
            });
        }
    }

    handleCreateWorkspace(option) {
        const { hideLoading } = this.props;
        api.createWorkspace(option).then(res => {
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
        globalKey: state.userState.global_key,
        language: state.language,
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

export default connect(mapState, mapDispatch)(withRouter(Coding));
