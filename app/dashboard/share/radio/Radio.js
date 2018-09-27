import React from 'react';

import './radio.css';

const Radio = ({ checked, onClick, disabled }) => {
    return (
        <div className={`ide-radio${checked ? ' checked' : ''}${disabled ? ' disabled' : ''}`} onClick={onClick}></div>
    );
}

export default Radio;
