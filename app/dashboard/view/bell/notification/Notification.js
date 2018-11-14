import React, { Component } from 'react';

import './notification.css';

class Notification extends Component {
    state = {
        spread: false,
    }

    render() {
        const { spread } = this.state;
        const { id, content, status } = this.props;
        if (Number(status) === 0) {
            return (
                <div className="view-notification unread" onClick={() => this.handleSpreadAndMarkReaded(id)}>
                    <div className="point">
                        <div className="dot"></div>
                    </div>
                    <div className={`content${spread ? ' spread' : ''}`} dangerouslySetInnerHTML={{ __html: content }}></div>
                </div>
            );
        } else {
            return (
                <div className="view-notification" onClick={this.handleSpread}>
                    <div className="point"></div>
                    <div className={`content${spread ? ' spread' : ''}`} dangerouslySetInnerHTML={{ __html: content }}></div>
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
}

export default Notification;
