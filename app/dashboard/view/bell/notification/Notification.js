import React from 'react';

import './notification.css';

const Notification = ({ id, content, status, markReaded }) => {
    if (Number(status) === 0) {
        return (
            <div className="view-notification unread" onClick={() => markReaded(id)}>
                <div className="dot"></div>
                <span dangerouslySetInnerHTML={{ __html: content }}></span>
            </div>
        );
    } else {
        return (
            <div className="view-notification" dangerouslySetInnerHTML={{ __html: content }}></div>
        );
    }
}

export default Notification;
