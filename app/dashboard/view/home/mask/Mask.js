import React from 'react';

import './mask.css';

import i18n from '../../../utils/i18n';

const Mask = () => {
    return (
        <div className="dash-global-mask">
            <div className="panel">
                <div className="line">{i18n('global.globalTip1')}</div>
                <div className="line">{i18n('global.globalTip2')}</div>
                <div className="control">
                    <a href="https://dev.tencent.com/user/account" target="_blank" rel="noopener noreferrer">
                        <button className="com-button primary">{i18n('global.gotoModify')}</button>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default Mask;
