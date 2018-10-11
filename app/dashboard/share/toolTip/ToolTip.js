import React from 'react';

import './toolTip.css';

const ToolTip = ({ on, message, placement = 'center' }) => {
    return (
        <div className={`dash-tooltip ${placement}${on ? ' on' : ''}`}>{message}</div>
    );
}

export default ToolTip;
