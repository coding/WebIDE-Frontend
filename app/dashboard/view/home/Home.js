import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Link, Switch, Route } from 'react-router-dom';

import './home.css';
import cloudstudio from '../../static/cloudstudio.svg';

import api from '../../api';
import i18n from '../../utils/i18n';
import Stripe from '../../share/stripe';
import Setting from './setting';
import Banner from '../banner';
import Workspace from '../workspace';
import Create from '../create';
import Config from '../config';
import About from '../about';

class Home extends Component {
    render() {
        const { isMbarOn, workspaceCount, switchMbarToOff } = this.props;
        return (
            <div id="dash-container">
                <div className="dash-mbar">
                    <div className="logo">
                        <img src={cloudstudio} alt="logo" />
                        <span className="beta">beta</span>
                    </div>
                    <Stripe />
                </div>
                <div className={`dash-mnav${isMbarOn ? ' on' : ''}`}>
                    <Link className="nav-item" to='/dashboard/workspace' onClick={switchMbarToOff}>{i18n('global.workspace')} ({workspaceCount})</Link>
                    <Link className="nav-item" to='/dashboard/config' onClick={switchMbarToOff}>{i18n('global.config')}</Link>
                    <Link className="nav-item" to="/dashboard/about" onClick={switchMbarToOff}>{i18n('global.about')}</Link>
                    <a className="nav-item" href="https://dev.tencent.com/" target="_blank" rel="noopener noreferrer" onClick={switchMbarToOff}>{i18n('global.devPlatform')}</a>
                    <a className="nav-item" href="https://coding.net/help/doc/webide" target="_blank" rel="noopener noreferrer" onClick={switchMbarToOff}>{i18n('global.docs')}</a>
                    <a className="nav-item" href="https://feedback.coding.net/" target="_blank" rel="noopener noreferrer" onClick={switchMbarToOff}>{i18n('global.feedback')}</a>
                </div>
                <div className="dash-sidebar">
                    <div className="logo">
                        <img src={cloudstudio} alt="logo" />
                        <span className="beta">beta</span>
                    </div>
                    <div className="nav">
                        <NavLink className="nav-item" activeClassName="active" to='/dashboard/workspace'>{i18n('global.workspace')} ({workspaceCount})</NavLink>
                        <NavLink className="nav-item" activeClassName="active" to='/dashboard/config'>{i18n('global.config')}</NavLink>
                    </div>
                    <Setting />
                </div>
                <div className="dash-main">
                    <Banner />
                    <div className="dash-view">
                        <Switch>
                            <Route exact path="/dashboard/workspace" component={Workspace}></Route>
                            <Route exact path="/dashboard/workspace/create" component={Create}></Route>
                            <Route exact path="/dashboard/config" component={Config}></Route>
                            <Route exact path="/dashboard/about" component={About}></Route>
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { history, location, workspaceCount, storeWorkspaceCount, isMbarOn, switchMbarToOff } = this.props;
        // 跳转
        if (location.pathname === '/dashboard') {
            history.push({ pathname: '/dashboard/workspace' });
        }
        // 给顶层 window 发送消息
        history.listen(route => {
            window.top.postMessage({ path: route.pathname }, '*');
        });
        window.top.postMessage({ path: window.location.pathname }, '*');
        // 同步工作空间数量
        if (!workspaceCount) {
            api.getWorkspace().then(res => {
                if (res.code === 0) {
                    storeWorkspaceCount(res.data.list.length);
                }
            });
        }
        window.addEventListener('resize', () => {
            const { isMbarOn } = this.props;
            if (document.documentElement.clientWidth > 860 && isMbarOn) {
                switchMbarToOff();
            }
        });
    }
}

const mapState = (state) => {
    return {
        workspaceCount: state.workspaceCount,
        isMbarOn: state.isMbarOn,
    }
}

const mapDispatch = (dispatch) => {
    return {
        storeWorkspaceCount: (payload) => {
            dispatch({ type: 'STORE_WORKSPACE_COUNT', payload })
        },
        switchMbarToOff: () => dispatch({ type: 'SWITCH_MBAR_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(Home);
