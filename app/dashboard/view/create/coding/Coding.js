import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './coding.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import ProjectCard from '../projectCard';
import TemplateCard from '../templateCard';
import EnvCard from '../envCard';
import NoData from '../../../share/noData';
import { notify, NOTIFY_TYPE } from 'components/Notification/actions';
import * as maskActions from 'components/Mask/actions';

class Coding extends Component {
    state = {
        type: 1,
        desc: '',
        ownerName: '',
        projectName: '',
        templateId: -1,
        envId: 'ide-tty',
        isCreating: false,
        filter: '',
        isSync: false,
    };

    render() {
        const { type, desc, ownerName, projectName, templateId, envId, isCreating, filter, isSync } = this.state;
        let { projects, templates, envs, language } = this.props;
        if (filter) {
            projects = projects.filter(item => item.ownerName.toLowerCase().includes(filter) || item.name.toLowerCase().includes(filter));
        }
        const disabled = type === 1 ? (!projectName || !envId) : (!projectName || !templateId);
        let inputPh, textareaPh, searchPh;
        // placeholder 中英文
        if (language === 'zh_CN') {
            inputPh = '输入项目名';
            textareaPh = '一句话描述这个工作空间';
            searchPh = '搜索';
        } else {
            inputPh = 'Enter the project name';
            textareaPh = 'Describe this workspace in one sentence';
            searchPh = 'Search';
        }
        return (
            <div>
                {type === 2 && (
                    <div className="com-board">
                        <div className="board-label">{i18n('global.projectName')}*</div>
                        <div className="board-content">
                            <input className="com-input" type="text" spellCheck={false} placeholder={inputPh} value={projectName} onChange={this.handleProjectName} />
                            <div className="input-tip">{i18n('global.inputTip')}</div>
                        </div>
                    </div>
                )}
                {/* <div className="com-board">
                    <div className="board-label">{i18n('global.description')}</div>
                    <div className="board-content desc">
                        <textarea className="com-textarea" spellCheck={false} placeholder={textareaPh} value={desc} onChange={this.handleDescription}></textarea>
                    </div>
                </div> */}
                <div className="com-board">
                    <div className="board-label">{type === 1 ? i18n('global.project') : i18n('global.template')}*</div>
                    <div className="board-content project">
                        <div className="project-head">
                            <div className="project-head-left">
                                <div className={`item${type === 1 ? ' active' : ''}`} onClick={() => this.handleType(1)}>{i18n('global.existingProject')}</div>
                                <div className={`item${type === 2 ? ' active' : ''}`} onClick={() => this.handleType(2)}>{i18n('global.templateProject')}</div>
                            </div>
                            {type === 1 && (
                                <div className="project-head-right">
                                    <input className="com-input" type="text" spellCheck={false} placeholder={searchPh} value={filter} onChange={this.handleFilter} />
                                    {
                                        isSync
                                        ? <span className="async"><i className="fa fa-refresh fa-spin"></i>{i18n('global.syncing')}</span>
                                        : <span className="async" onClick={this.handleSync}><i className="fa fa-refresh"></i>{i18n('global.sync')}</span>
                                    }
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
                                    ) : i18n('global.noProject')
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
                    <div className="com-board">
                        <div className="board-label">
                            {i18n('global.env')}
                            *
                            <span className="tooltip-container" onMouseEnter={this.handleEnvToolTip}>
                                <i className="fa fa-question-circle"></i>
                            </span>
                        </div>
                        <div className="board-content env">
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
                        <button className="com-button primary" disabled={disabled} onClick={this.handleCreate}>
                            {isCreating ? i18n('global.creating') : i18n('global.create')}
                        </button>
                        <button className="com-button default" onClick={this.handleCancel}>{i18n('global.cancel')}</button>
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
            desc: '',
            ownerName: '',
            projectName: '',
            templateId: -1,
            envId: 'ide-tty',
        });
    }

    handleEnvToolTip = (event) => {
        this.props.handleToolTipOn({
            width: 300,
            clientX: event.clientX,
            clientY: event.clientY,
            message: i18n('global.envTip'),
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

    handleDescription = (event) => {
        this.setState({ desc: event.target.value });
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

    handleCancel = () => {
        this.props.history.push({ pathname: '/dashboard/workspace' });
    }

    handleCreate = () => {
        const { desc, type, ownerName, projectName, envId, templateId } = this.state;
        const { globalKey } = this.props;
        const option = {
            cpuLimit: 2,
            memory: 512,
            storage: 2,
            source: 'Coding',
            //desc,
            ownerName: ownerName || globalKey,
            projectName,
        };
        this.setState({ isCreating: true });
        maskActions.showMask({ message: i18n('global.creatingWS'), shouldHideVideo: true });
        if (type === 1) {
            option.envId = envId;
            this.handleCreateWorkspace(option);
        } else {
            option.templateId = templateId;
            api.createProject({
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
            }).then(res => {
                if (res.code === 0) {
                    this.handleCreateWorkspace(option);
                } else {
                    this.setState({ isCreating: false });
                    maskActions.hideMask();
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
                    notify({
                        notifyType: NOTIFY_TYPE.ERROR,
                        message,
                    });
                }
            }).catch(err => {
                this.setState({ isCreating: false });
                maskActions.hideMask();
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
            });
        }
    }

    handleCreateWorkspace(option) {
        api.createWorkspace(option).then(res => {
            this.setState({ isCreating: false });
            maskActions.hideMask();
            if (res.code === 0) {
                this.props.history.push({ pathname: '/dashboard/workspace' });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: res.msg || 'Failed to create workspace' });
            }
        }).catch(err => {
            this.setState({ isCreating: false });
            maskActions.hideMask();
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapState = (state) => {
    return {
        globalKey: state.userState.global_key,
        language: state.language,
    }
}

const mapDispatch = (dispatch) => {
    return {
        handleToolTipOn: (payload) => dispatch({ type: 'TOOLTIP_ON', payload }),
    }
}

export default connect(mapState, mapDispatch)(withRouter(Coding));
