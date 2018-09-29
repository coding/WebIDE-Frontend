import React, { Component } from 'react';
import { connect } from 'react-redux';
import Clipboard from 'clipboard';

import './ssh.css';

import api from '../../api';
import i18n from '../../utils/i18n';

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
                    <i className='clipboard fa fa-copy' ref={el => this.ref = el} />
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { handleToolTipOn } = this.props;
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
        clipboard.on('success', () => {
            const rect = this.ref.getBoundingClientRect();
            handleToolTipOn({
                clientX: rect.left + rect.width / 2,
                clientY: rect.top,
                message: '复制成功',
            });
        });
        clipboard.on('error', () => {
            const rect = this.ref.getBoundingClientRect();
            handleToolTipOn({
                clientX: rect.left + rect.width / 2,
                clientY: rect.top,
                message: '复制失败',
            });
        });
    }
}

const mapDispatch = (dispatch) => {
    return {
        handleToolTipOn: (payload) => dispatch({ type: 'TOOLTIP_ON', payload }),
    }
}

export default connect(null, mapDispatch)(SSH);
