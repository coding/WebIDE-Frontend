import React from 'react';

import './bulletin.css';

import i18n from '../../../utils/i18n';

const Bulletin = ({ close }) => {
    return (
        <div className="dash-bulletin">
            <span>{i18n('global.eventStreamBulletin1')}</span>
            <a href="https://mp.weixin.qq.com/s/IaOWxG0XLvn2znvvP1dmwA" target="_blank">{i18n('global.eventStreamBulletin2')}</a>
            <span>{i18n('global.eventStreamBulletin3')}</span>
            <i className="fa fa-remove" onClick={close}></i>
        </div>
    );
}

export default Bulletin;
