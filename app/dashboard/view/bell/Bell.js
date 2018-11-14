import React, { Component } from 'react';

import './bell.css';

import Notification from './notification';
import Message from './message';

import api from '../../api';
import i18n from '../../utils/i18n';
import config from '../../utils/config';

class Bell extends Component {
    state = {
        tab: 1,
        nList: [],
        mList: [],
    }

    render() {
        const { tab, nList, mList } = this.state;
        const { on, togglePanel } = this.props;
        const nLen = nList.length > 0;
        const mLen = mList.length > 0;
        const nHave = nList.some(v => Number(v.status) === 0);
        const mHave = mList.some(v => Number(v.status) === 0);
        const haveBell = nHave || mHave;
        return (
            <div className="dash-bell">
                <div className="bell" onClick={togglePanel}>
                    <i className="fa fa-bell"></i>
                    {haveBell && <div className="dot"></div>}
                </div>
                <div className={`panel${on ? ' on' : ''}`} onClick={(event) => event.stopPropagation()}>
                    <div className="tab">
                        <div className={`tab-item${tab === 1 ? ' on' : ''}`} onClick={() => this.toggleTab(1)}>
                            {i18n('global.notification')}
                            {nHave && <div className="dot"></div>}
                        </div>
                        <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.toggleTab(2)}>
                            {i18n('global.message')}
                            {mHave && <div className="dot"></div>}
                        </div>
                    </div>
                    <div className="view">
                        {tab === 1 && (
                            nLen ? (
                                nList.map(n => <Notification key={n.id} {...n} markReaded={this.markReaded} />)
                            ) : <div className="no-bell">{i18n('global.noNotification')}</div>
                        )}
                        {tab === 2 && (
                            mLen ? (
                                mList.map(m => <Message key={m.id} {...m} markReaded={this.markMessageReaded} />)
                            ) : <div className="no-bell">{i18n('global.noMessage')}</div>
                        )}
                    </div>
                    {tab === 1 && nLen && (
                        <div className="readall">
                            <a href="https://dev.tencent.com/user/notifications/basic" target="_blank" rel="noopener noreferrer">
                                {i18n('global.readAllNotification')}
                            </a>
                        </div>
                    )}
                    {tab === 2 && mLen && (
                        <div className="readall">
                            <a href="https://dev.tencent.com/user/messages/basic" target="_blank" rel="noopener noreferrer">
                                {i18n('global.readAllMessage')}
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.fetchNotification();
        this.fetchMessage();
    }

    fetchNotification() {
        api.getNotification().then(res => {
            if (res.code === 0) {
                this.setState({ nList: res.data });
            }
        });
    }

    fetchMessage() {
        api.getMessage().then(res => {
            if (res.code === 0) {
                this.setState({ mList: res.data });
            }
        });
    }

    markReaded = (id) => {
        api.markReaded({ id }).then(res => {
            if (res.code === 0) {
                this.fetchNotification();
            }
        });
    }

    markMessageReaded = ({ id, name }) => {
        const { mList } = this.state;
        this.setState({ mList: mList.map(v => v.id === id ? { ...v, status: '1' } : v) });
        window.open(`${config.devOrigin}/user/messages/history/${name}`);
    }

    toggleTab = (tab) => {
        this.setState({ tab });
    }
}

export default Bell;
