import React, { Component } from 'react';

import './message.css';

import completeUrl from '../../../utils/completeUrl';

class Message extends Component {
    state = {
        spread: false,
    }

    render() {
        const { spread } = this.state;
        const { id, friend, content, status, markReaded } = this.props;
        const { name, avatar, global_key } = friend;
        if (Number(status) === 0) {
            return (
                <div className="view-message unread" onClick={() => markReaded({ id, name: global_key})}>
                    <div className="point">
                        <div className="dot"></div>
                    </div>
                    <img className="avatar" src={completeUrl(avatar)} alt="avatar" />
                    <div className="main">
                        <div className="name">{name}</div>
                        <div className={`content${spread ? ' spread' : ''}`} dangerouslySetInnerHTML={{ __html: this.parseTag(content) }}></div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="view-message" onClick={() => markReaded({ id, name: global_key })}>
                    <div className="point"></div>
                    <img className="avatar" src={completeUrl(avatar)} alt="avatar" />
                    <div className="main">
                        <div className="name">{name}</div>
                        <div className={`content${spread ? ' spread' : ''}`} dangerouslySetInnerHTML={{ __html: this.parseTag(content) }}></div>
                    </div>
                </div>
            );
        }
    }

    handleSpread = () => {
        this.setState(prevState => ({ spread: !prevState.spread }));
    }

    handleSpreadAndMarkReaded = (id) => {
        this.handleSpread();
        this.props.markReaded(id);
    }

    parseTag = (content) => {
        const container = document.createElement('div')
        container.innerHTML = content;
        let str = '<p>';
        for (const item of container.children) {
            str += item.innerHTML;
        }
        str += '</p>';
        return str;
    }
}

export default Message;
