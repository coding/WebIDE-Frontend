import React from 'react';

import './intro.css';

import i18n from '../../../utils/i18n';

const Intro = () => {
    return (
        <div className="intro">
            <div className="title">{i18n('ws.welcomeToCS')}</div>
            <div className="line">{i18n('ws.welcomeLineOne')}</div>
            <div className="line">
                {i18n('ws.welcomeLineTwo')}
                <a href="https://dev.tencent.com/help/cloud-studio/about-new-cloud-studio" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
            </div>
        </div>
    );
}

export default Intro;
