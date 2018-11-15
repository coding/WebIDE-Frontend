import React, { Component } from 'react';
import Clipboard from 'clipboard';

import './ssh.css';

import api from '../../api';
import i18n from '../../utils/i18n';

let _sshPublicKey = '';

class SSH extends Component {
    state = {
        publicKey: '',
        copyed: false,
    };
    timeout = null;
    clipboard = null;

    render() {
        const { publicKey, copyed } = this.state;
        return (
            <div className="com-ssh">
                <div className="ssh-tip">
                    {i18n('ws.sshTip')}
                    <a href="https://dev.tencent.com/help/cloud-studio/how-to-add-ssh" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
                </div>
                <div className="ssh-content">
                    <div id="ssh-clipboard">{publicKey}</div>
                    {publicKey && <div className={`ssh-tooltip${copyed ? ' on' : ''}`}>{i18n('global.copyed')}</div>}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.clipboard = new Clipboard('#ssh-clipboard', {
            text: trigger => trigger.innerText,
        });
        this.clipboard.on('success', (event) => {
            this.setState({ copyed: true });
            event.clearSelection();
            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.setState({ copyed: false });
            }, 1000);
        });
        if (_sshPublicKey) {
            this.setState({ publicKey: _sshPublicKey });
            return;
        }
        api.getSSHPublicKey().then(res => {
            if (res.code === 0) {
                const publicKey = res.data.publicKey;
                _sshPublicKey = publicKey;
                this.setState({ publicKey: publicKey });
            }
        });
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        this.clipboard.destroy();
    }
}

export default SSH;
