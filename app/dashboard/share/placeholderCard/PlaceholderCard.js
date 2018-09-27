import React from 'react';

import './placeholderCard.css';

const PlaceholderCard = ({ style = {} }) => {
    const height = (style.height || 80) - 20;
    return (
        <div className="com-card placeholder-card" style={style}>
            <div className="inner">
                <div className="avatar" style={{ width: height, height }}>
                    <i className="fa fa-coffee"></i>
                </div>
                <div className="content">null</div>
            </div>
        </div>
    );
}

export default PlaceholderCard;
