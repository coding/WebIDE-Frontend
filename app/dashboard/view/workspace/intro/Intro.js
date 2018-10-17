import React from 'react';

import './intro.css';

import i18n from '../../../utils/i18n';

const Intro = ({ handler }) => {
    return (
        <div className="intro">
            <div className="title">{i18n('ws.welcomeToCS')}</div>
            <div className="detail">{i18n('ws.welcomeLineOne')}</div>
            <a href="https://dev.tencent.com/help/cloud-studio/about-new-cloud-studio" target="_blank" rel="noopener noreferrer">{i18n('global.more')}</a>
            <i className="fa fa-close" onClick={handler}></i>
        </div>
    );
}

export default Intro;
