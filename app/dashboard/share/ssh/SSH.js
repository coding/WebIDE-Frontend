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
                    <i className="fa fa-copy" ref={el => this.ref = el} />
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
        const clipboard = new Clipboard('.ssh-content', {
            text: trigger => trigger.innerText,
        })
        clipboard.on('success', () => {
            const { language } = this.props;
            const rect = this.ref.getBoundingClientRect();
            handleToolTipOn({
                width: language === 'zh_CN' ? 70 : 100,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top,
                message: i18n('global.copySuccess'),
            });
        });
        clipboard.on('error', () => {
            const { language } = this.props;
            const rect = this.ref.getBoundingClientRect();
            handleToolTipOn({
                width: language === 'zh_CN' ? 70 : 100,
                clientX: rect.left + rect.width / 2,
                clientY: rect.top,
                message: i18n('global.copyFailure'),
            });
        });
    }
}

const mapState = (state) => {
    return { language: state.language };
}

const mapDispatch = (dispatch) => {
    return {
        handleToolTipOn: (payload) => dispatch({ type: 'TOOLTIP_ON', payload }),
    }
}

export default connect(mapState, mapDispatch)(SSH);
