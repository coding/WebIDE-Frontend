import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import './coding.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import ProjectCard from '../projectCard';
import TemplateCard from '../templateCard';
import EnvCard from '../envCard';
import PlaceholderCard from '../../../share/placeholderCard';
import { notify, NOTIFY_TYPE } from '../../../../components/Notification/actions';

class Coding extends Component {
    state = {
        type: 1,
        desc: '',
        ownerName: '',
        projectName: '',
        templateId: -1,
        envId: '',
        filter: '',
    };

    render() {
        const { type, desc, projectName, templateId, envId, filter } = this.state;
        let { projects, templates, envs } = this.props;
        if (filter) {
            projects = projects.filter(item => item.ownerName.includes(filter) || item.name.includes(filter));
        }
        return (
            <div>
                {type === 2 && (
                    <div className="com-board">
                        <div className="board-label">{i18n('global.projectName')}*</div>
                        <div className="board-content">
                            <input className="com-input" type="text" spellCheck={false} value={projectName} onChange={this.handleProjectName} />
                            <div className="input-tip">{i18n('global.inputTip')}</div>
                        </div>
                    </div>
                )}
                <div className="com-board">
                    <div className="board-label">{i18n('global.description')}</div>
                    <div className="board-content desc">
                        <textarea className="com-textarea" spellCheck={false} value={desc} onChange={this.handleDescription}></textarea>
                    </div>
                </div>
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
                                    <input className="com-input" type="text" spellCheck={false} value={filter} onChange={this.handleFilter} />
                                    <span className="async" onClick={this.handleAsync}><i className="fa fa-refresh"></i>{i18n('global.async')}</span>
                                </div>
                            )}
                        </div>
                        <div className="project-body">
                            {
                                type === 1 ? (
                                    projects.length ? (
                                        projects.map(item => <ProjectCard key={item.id} {...item}
                                            projectName={projectName}
                                            handleSeleteProject={this.handleSeleteProject} />
                                        )
                                    ) : <PlaceholderCard style={{ width: 240, height: 60 }} />
                                ) : (
                                    templates.length ? (
                                        templates.map(item => <TemplateCard key={item.id} {...item}
                                            templateId={templateId}
                                            handleSeleteTemplate={this.handleSeleteTemplate} />
                                        )
                                    ) : <PlaceholderCard style={{ width: 240, height: 60 }} />
                                )
                            }
                        </div>
                    </div>
                </div>
                {type === 1 && (
                    <div className="com-board">
                        <div className="board-label">{i18n('global.env')}*</div>
                        <div className="board-content env">
                            {
                                envs.length ? (
                                    envs.map(env => <EnvCard key={env.name} {...env}
                                        envId={envId}
                                        handleSeleteEnv={this.handleSeleteEnv} />
                                    )
                                ) : <PlaceholderCard style={{ width: 250, height: 60 }} />
                            }
                        </div>
                    </div>
                )}
                <div className="com-board">
                    <div className="board-label"></div>
                    <div className="board-content">
                        {type === 1 && <button className="com-button primary" disabled={!projectName || !envId} onClick={this.handleCreate}>{i18n('global.create')}</button>}
                        {type === 2 && <button className="com-button primary" disabled={!projectName || !templateId} onClick={this.handleCreate}>{i18n('global.create')}</button>}
                        <button className="com-button default" onClick={this.handleCancel}>{i18n('global.cancel')}</button>
                    </div>
                </div>
            </div>
        );
    }

    handleType = (type) => {
        this.setState({
            type,
            desc: '',
            ownerName: '',
            projectName: '',
            templateId: -1,
            envId: '',
        });
    }

    handleFilter = (event) => {
        this.setState({ filter: event.target.value });
    }

    handleAsync = () => {
        api.syncProject().then(res => {
            notify({ message: 'Async project success' });
        }).catch(err => {
            console.log(err);
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
        this.setState({
            desc: '',
            ownerName: '',
            projectName: '',
            templateId: -1,
            envId: '',
        });
    }

    handleCreate = () => {
        const { desc, type, ownerName, projectName, envId, templateId } = this.state;
        const { globalKey } = this.props;
        const option = {
            cpuLimit: 2,
            memory: 512,
            storage: 2,
            source: 'Coding',
            desc,
            ownerName: ownerName || globalKey,
            projectName,
        };
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
                desc,
                joinTeam: false,
                teamGK: globalKey,
            }).then(res => {
                if (res.code === 0) {
                    this.handleCreateWorkspace(option);
                } else {
                    notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to create project' });
                }
            }).catch(err => {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
            });
        }
    }

    handleCreateWorkspace(option) {
        api.createWorkspace(option).then(res => {
            if (res.code === 0) {
                this.props.history.push({ pathname: '/dashboard/workspace' });
            } else {
                notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Failed to create workspace' });
            }
        }).catch(err => {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: err });
        });
    }
}

const mapState = (state) => {
    return {
        globalKey: state.userState.global_key,
    }
}

export default connect(mapState)(withRouter(Coding));
