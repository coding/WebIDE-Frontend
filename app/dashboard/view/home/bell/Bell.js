import React, { Component } from 'react';

import './bell.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';

class Bell extends Component {
    state = {
        tab: 1,
        nList: [],
        mList: [],
    }

    render() {
        const { tab, nList, mList } = this.state;
        const { on, togglePanel } = this.props;
        const nHave = nList.length > 0;
        const mHave = mList.length > 0;
        const haveBell = nHave || mHave;
        return (
            <div className="dash-bell">
                {
                    haveBell ? (
                        <div className="bell" onClick={togglePanel}>
                            <i className="fa fa-bell"></i>
                            <div className="dot"></div>
                        </div>
                    ) : (
                        <div className="bell">
                            <i className="fa fa-bell"></i>
                        </div>
                    )
                }
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
                            nHave ? (
                                nList.map(n => <Row key={n.id} {...n} markNotification={this.markNotification} />)
                            ) : <div className="no-bell">{i18n('global.noNotification')}</div>
                        )}
                        {tab === 2 && (
                            mHave ? (
                                mList.map(m => <Row key={m.id} {...m} />)
                            ) : <div className="no-bell">{i18n('global.noMessage')}</div>
                        )}
                    </div>
                    {tab === 1 && nHave && (
                        <div className="readall">
                            <a href="https://dev.tencent.com/user/notifications/basic" target="_blank" rel="noopener noreferrer">
                                {i18n('global.readAllNotification')}
                            </a>
                        </div>
                    )}
                    {tab === 2 && mHave && (
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

    markNotification = (id) => {
        api.notificationMarkRead({ id }).then(res => {
            //console.log(res);
        });
    }

    fetchMessage() {
        api.getMessage().then(res => {
            if (res.code === 0) {
                this.setState({ mList: res.data });
            }
        });
    }

    toggleTab = (tab) => {
        this.setState({ tab });
    }
}

const Row = ({ id, content, reminded, markNotification }) => {
    if (reminded) {
        return (
            <div className="view-item" dangerouslySetInnerHTML={{ __html: content }}></div>
        );
    } else {
        return (
            <div className="view-item unread" onClick={() => markNotification(id)}>
                <div className="dot"></div>
                <span dangerouslySetInnerHTML={{ __html: content }}></span>
            </div>
        );
    }
}

export default Bell;
