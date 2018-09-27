import React, { Component } from 'react';

import './git.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';
import SSH from '../../../share/ssh';
import EnvCard from '../envCard';
import PlaceholderCard from '../../../share/placeholderCard';
import { notify, NOTIFY_TYPE } from '../../../../components/Notification/actions';

class Git extends Component {
    state = {
        desc: '',
        url: '',
        envId: '',
    }

    render() {
        const { desc, url, envId } = this.state;
        const { envs } = this.props;
        return (
            <div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.description')}</div>
                    <div className="board-content desc">
                        <textarea className="com-textarea" spellCheck={false} value={desc} onChange={this.handleDescription}></textarea>
                    </div>
                </div>
                <div className="com-board">
                    <div className="board-label">{i18n('global.repoUrl')}*</div>
                    <div className="board-content repo">
                        <div><input className="com-input repo-input" type="text" spellCheck={false} value={url} onChange={this.handleUrl} /></div>
                        <SSH />
                    </div>
                </div>
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
                <div className="com-board">
                    <div className="board-label"></div>
                    <div className="board-content">
                        <button className="com-button primary" disabled={!url || !envId} onClick={this.handleCreate}>{i18n('global.create')}</button>
                        <button className="com-button default" onClick={this.handleCancel}>{i18n('global.cancel')}</button>
                    </div>
                </div>
            </div>
        );
    }

    handleDescription = (event) => {
        this.setState({ desc: event.target.value });
    }

    handleUrl = (event) => {
        this.setState({ url: event.target.value });
    }

    handleSeleteEnv = (envId) => {
        this.setState({ envId: envId });
    }

    handleCancel = () => {
        this.setState({
            desc: '',
            url: '',
            envId: '',
        });
    }

    handleCreate = () => {
        const { desc, url, envId } = this.state;
        if (!url || !envId) {
            notify({ notifyType: NOTIFY_TYPE.ERROR, message: 'Please fill in all required fields' });
            return;
        }
        const option = {
            cpuLimit: 2,
            memory: 512,
            storage: 2,
            source: 'Import',
            desc,
            url,
            envId,
        }
        api.cloneWorkspace(option).then(res => {
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

export default Git;
