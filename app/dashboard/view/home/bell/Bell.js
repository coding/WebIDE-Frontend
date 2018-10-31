import React, { Component } from 'react';

import './bell.css';

import api from '../../../api';
import i18n from '../../../utils/i18n';

class Bell extends Component {
    state = {
        tab: 1,
        nList: [
            {
                id: 1,
                value: '通知，你仍然单身',
                unread: true,
            },
            {
                id: 2,
                value: '通知，你仍然单身',
                unread: false,
            },
            {
                id: 3,
                value: '通知，你仍然单身',
                unread: true,
            }
        ],
        mList: [
            {
                id: 1,
                value: '私信，你仍然单身',
                unread: true,
            },
            {
                id: 2,
                value: '私信，你仍然单身',
                unread: true,
            },
            {
                id: 3,
                value: '私信，你仍然单身',
                unread: true,
            }
        ],
    }

    render() {
        const { tab, nList, mList } = this.state;
        const { on, togglePanel } = this.props;
        const haveBell = nList.length > 0 || mList.length > 0;
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
                            {nList.length > 0 && <div className="dot"></div>}
                        </div>
                        <div className={`tab-item${tab === 2 ? ' on' : ''}`} onClick={() => this.toggleTab(2)}>
                            {i18n('global.message')}
                            {mList.length > 0 && <div className="dot"></div>}
                        </div>
                    </div>
                    <div className="view">
                        {tab === 1 && nList.map(n => <Row key={n.id} {...n} />)}
                        {tab === 2 && mList.map(m => <Row key={m.id} {...m} />)}
                    </div>
                    <div className="readall">
                        {tab === 1 && i18n('global.readAllNotification')}
                        {tab === 2 && i18n('global.readAllMessage')}
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        //this.fetchNotification();
    }

    fetchNotification() {
        api.getNotification().then(res => {
            console.log(res);
        });
    }

    fetchMessage() {
        api.getMessage().then(res => {
            console.log(res);
        });
    }

    toggleTab = (tab) => {
        this.setState({ tab });
    }
}

const Row = ({ value, unread }) => {
    return (
        <div className="view-item">
            {unread && <div className="dot"></div>}
            <span>{value}</span>
        </div>
    );
}

export default Bell;
