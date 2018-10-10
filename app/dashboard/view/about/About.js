import React, { Component } from 'react';

import './about.css';
import cloudstudio from '../../static/cloudstudio.svg';
import coding from './img/coding.png';
import tencentcloud from './img/tencentcloud.png';

import i18n from '../../utils/i18n';

class About extends Component {
    state = {
        width: '100%',
        height: '100%',
    }

    render() {
        const { width, height } = this.state;
        return (
            <div className="dash-about" style={{ width, height }}>
                <div className="up"></div>
                <div className="center">
                    <div className="logo">
                        <img src={cloudstudio} alt="cloudstudio" />
                        <div className="beta">beta</div>
                    </div>
                    <div className="desc">
                        <span className="version">V 3.0</span>
                        <a href="/changelog" target="_blank" rel="noopener noreferrer">{i18n('global.viewChangelog')}</a>
                    </div>
                </div>
                <div className="below">
                    <div className="produce">
                        <div className="corp">
                            <div className="role">{i18n('global.produce')}</div>
                            <a href="https://coding.net" target="_blank" rel="noopener noreferrer">
                                <img src={coding} alt="Coding Logo" />
                            </a>
                        </div>
                        <div className="x">＋</div>
                        <div className="corp">
                            <div className="role">{i18n('global.computeSupport')}</div>
                            <a href="https://cloud.tencent.com/" target="_blank" rel="noopener noreferrer">
                                <img src={tencentcloud} alt="Tencent Logo" />
                            </a>
                        </div>
                    </div>
                    <div className="copyright">Copyright @ 2015-{new Date().getFullYear()}. {i18n('global.copyright')}</div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener('resize', this.handleResize);
    }

    handleResize = () => {
        const w = document.documentElement.clientWidth - 60;
        this.setState({
            width: w > 660 ? w - 200 : w,
            height: document.documentElement.clientHeight - 60 - 60,
        });
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.handleResize);
    }
}

export default About;
