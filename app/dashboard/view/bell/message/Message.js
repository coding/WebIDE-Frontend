import React from 'react';

import './message.css';

const Message = ({ id, sender, content, status, markReaded }) => {
    const { name, avatar } = sender;
    if (Number(status) === 0) {
        return (
            <div className="view-message unread" onClick={() => markReaded(id)}>
                <div className="from">
                    <div className="dot"></div>
                    <img src={avatar} alt="avatar" />
                    <span className="name">{name}</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        );
    } else {
        return (
            <div className="view-message">
                <div className="from">
                    <img src={avatar} alt="avatar" />
                    <span className="name">{name}</span>
                </div>
                <div dangerouslySetInnerHTML={{ __html: content }}></div>
            </div>
        );
    }
}

export default Message;
