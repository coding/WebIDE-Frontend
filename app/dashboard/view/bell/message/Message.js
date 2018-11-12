import React, { Component } from 'react';

import './message.css';

class Message extends Component {
    state = {
        spread: false,
    }

    render() {
        const { spread } = this.state;
        const { id, sender, content, status } = this.props;
        const { name, avatar } = sender;
        if (Number(status) === 0) {
            return (
                <div className="view-message unread" onClick={() => this.handleSpreadAndMarkReaded(id)}>
                    <div className="point">
                        <div className="dot"></div>
                    </div>
                    <img className="avatar" src={avatar} alt="avatar" />
                    <div className="main">
                        <div className="name">{name}</div>
                        <div className={`content${spread ? ' spread' : ''}`} dangerouslySetInnerHTML={{ __html: this.parseTag(content) }}></div>
                    </div>
                </div>
            );
        } else {
            return (
                <div className="view-message unread" onClick={this.handleSpread}>
                    <div className="point"></div>
                    <img className="avatar" src={avatar} alt="avatar" />
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
