import React, { Component } from 'react';

import './mask.css';

import Inbox from '../../../share/inbox';

import api from '../../../api';
import i18n from '../../../utils/i18n';

class Mask extends Component {
    state = {
        loading: false,
        value: '',
        error: '',
    }

    render() {
        const { loading, value, error } = this.state;
        return (
            <div className="dash-global-mask">
                <div className="panel">
                    <div className="line">{i18n('global.globalTip')}</div>
                    <Inbox holder="global.inputTip" value={value} onChange={this.handleChange} />
                    <div className={`error${error ? ' on' : ''}`}>{error}</div>
                    {!loading ? (
                        <button className="com-button primary" onClick={this.handleSubmit}>{i18n('global.ok')}</button>
                    ) : <button className="com-button primary">{i18n('global.submitting')}</button>}
                </div>
            </div>
        );
    }

    handleChange = (event) => {
        this.setState({ value: event.target.value });
    }

    handleSubmit = () => {
        const { value } = this.state;
        this.setState({ loading: true });
        api.renameGlobalKey({ newGlobalKey: value }).then(res => {
            this.setState({ loading: false });
            if (res.code === 0) {
                window.reload();
            } else {
                this.setState({ error: res.msg });
            }
        });
    }
}

export default Mask;
