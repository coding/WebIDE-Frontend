import React from 'react';

import './know.css';

import i18n from '../../utils/i18n';

const Know = ({ iknow, handler }) => {
    return (
        <div className="dash-know">
            {i18n('plugin.pushTip')}
            <div className="action" onClick={() => handler(!iknow)}>
                <i className={`fa fa-${iknow ? 'check-square' : 'square'}`}></i>
                {i18n('plugin.iknow')}
            </div>
        </div>
    );
}

export default Know;
