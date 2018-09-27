import React, { Component } from 'react';
import Clipboard from 'clipboard'

import './ssh.css';

import api from '../../api';
import i18n from '../../utils/i18n';
import { notify } from '../../../components/Notification/actions';

let _sshPublicKey = '';

class SSH extends Component {
    state = { publicKey: '' }

    render() {
        const { publicKey } = this.state;
        return (
            <div className="com-ssh">
                <div className="ssh-tip">{i18n('global.sshTip')}</div>
                <div className="ssh-content">
                    {publicKey}
                    <i className='clipboard fa fa-copy' />
                </div>
            </div>
        );
    }

    componentDidMount() {
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
        const clipboard = new Clipboard('.clipboard', {
            text: trigger => trigger.parentElement.innerText,
        })
        clipboard.on('success', () => notify({ message: '复制剪贴板成功' }));
        clipboard.on('error', () => notify({ message: '复制剪贴板失败' }));
    }
}

export default SSH;
