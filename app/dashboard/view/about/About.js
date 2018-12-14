import React from 'react';

import './about.css';
import cloudstudio from '../../static/cloudstudio.svg';
import coding from './img/coding.png';
import tencentcloud from './img/tencentcloud.png';

import i18n from '../../utils/i18n';
import config from '../../utils/config';

const url = window === window.top ? '/changelog' : `${config.studioOrigin}/changelog`;

const About = () => {
    return (
        <div className="dash-about">
            <div className="up"></div>
            <div className="center">
                <div className="logo">
                    <img src={cloudstudio} alt="" />
                </div>
                <div className="desc">
                    <span className="version">V 3.4</span>
                    <a href={url} target="_blank" rel="noopener noreferrer">{i18n('global.changelog')}</a>
                </div>
            </div>
            <div className="below">
                <div className="produce">
                    <div className="corp">
                        <div className="role">{i18n('global.produce')}</div>
                        <a href="https://coding.net" target="_blank" rel="noopener noreferrer">
                            <img src={coding} alt="" />
                        </a>
                    </div>
                    <div className="x">＋</div>
                    <div className="corp">
                        <div className="role">{i18n('global.computeSupport')}</div>
                        <a href="https://cloud.tencent.com/" target="_blank" rel="noopener noreferrer">
                            <img src={tencentcloud} alt="" />
                        </a>
                    </div>
                </div>
                <div className="copyright">Copyright @ 2015-{new Date().getFullYear()}. {i18n('global.copyright')}</div>
            </div>
        </div>
    );
}

export default About;
