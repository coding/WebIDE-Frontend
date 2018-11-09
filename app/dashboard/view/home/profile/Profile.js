import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import './profile.css';

import i18n from '../../../utils/i18n';
import api from '../../../api';

const httpReg = /^http/;
const REDIRECT_URL = 'https://studio.dev.tencent.com';

class Profile extends Component {
    render() {
        const { name, avatar } = this.props.user;
        const src = httpReg.test(avatar) ? avatar : `https://coding.net${avatar}`;
        return (
            <div className="dash-profile">
                <div className="profile">
                    {avatar && <img className="avatar" src={src} alt="avatar" />}
                    <span className="name">{name}</span>
                    <i className="caret fa fa-caret-up"></i>
                </div>
                <div className="panel">
                    <Link className="menu-item" to="/dashboard/about">{i18n('global.about')}</Link>
                    <a className="menu-item" href="https://dev.tencent.com/" target="_blank" rel="noopener noreferrer">{i18n('global.devPlatform')}</a>
                    <a className="menu-item" href="https://dev.tencent.com/help/doc/cloud-studio" target="_blank" rel="noopener noreferrer">{i18n('global.docs')}</a>
                    <a className="menu-item" href="https://feedback.coding.net/" target="_blank" rel="noopener noreferrer">{i18n('global.feedback')}</a>
                    <div className="menu-item" onClick={this.handleLogout}>{i18n('global.logout')}</div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        api.getUserProfile().then(res => {
            if (res.code === 0) {
                this.props.logIn(res.data);
            } else {
                window.top.postMessage({ path: '/intro' }, '*');
                window.location.href = '/intro';
            }
        });
    }

    handleLogout = () => {
        api.logout().then(res => {
            if (res.code === 0) {
                this.props.logOut();
                // window.top.postMessage({ path: '/intro' }, '*');
                // window.location.href = '/intro';
                window.top.postMessage({ state: {
                    type: 'redirect'
                }, path: 'https://cloud.tencent.com/login/quit?s_url=' + REDIRECT_URL }, '*');
            }
        });
    }
}

const mapState = (state) => {
    return {
        user: state.userState,
    }
}

const mapDispatch = (dispatch) => {
    return {
        logIn: (payload) => dispatch({ type: 'USER_LOG_IN', payload }),
        logOut: () => dispatch({ type: 'USER_LOG_OUT' }),
    }
}

export default connect(mapState, mapDispatch)(withRouter(Profile));
