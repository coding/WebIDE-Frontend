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
import Readme from '../readme';

class Home extends Component {
    render() {
        const { isMbarOn, wsCount, hideMbar } = this.props;
        return (
            <div id="dash-container">
                <div className="dash-mbar">
                    <div className="logo">
                        <Link to="/dashboard/workspace" onClick={hideMbar}><img src={cloudstudio} alt="logo" /></Link>
                        <span className="beta">beta</span>
                    </div>
                    <Stripe />
                </div>
                <div className={`dash-mnav${isMbarOn ? ' on' : ''}`}>
                    <Link className="nav-item" to="/dashboard/workspace" onClick={hideMbar}>{i18n('global.workspace')} ({wsCount})</Link>
                    <Link className="nav-item" to="/dashboard/config" onClick={hideMbar}>{i18n('global.config')}</Link>
                    <Link className="nav-item" to="/dashboard/about" onClick={hideMbar}>{i18n('global.about')}</Link>
                    <a className="nav-item" href="https://dev.tencent.com/" target="_blank" rel="noopener noreferrer" onClick={hideMbar}>{i18n('global.devPlatform')}</a>
                    <a className="nav-item" href="https://dev.tencent.com/help/doc/cloud-studio" target="_blank" rel="noopener noreferrer" onClick={hideMbar}>{i18n('global.docs')}</a>
                    <a className="nav-item" href="https://feedback.coding.net/" target="_blank" rel="noopener noreferrer" onClick={hideMbar}>{i18n('global.feedback')}</a>
                </div>
                <div className="dash-sidebar">
                    <div className="logo">
                        <Link to="/dashboard/workspace"><img src={cloudstudio} alt="logo" /></Link>
                        <span className="beta">beta</span>
                    </div>
                    <div className="nav">
                        <NavLink className="nav-item" activeClassName="active" to="/dashboard/workspace">{i18n('global.workspace')} ({wsCount})</NavLink>
                        <NavLink className="nav-item" activeClassName="active" to="/dashboard/config">{i18n('global.config')}</NavLink>
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
                            <Route exact path="/dashboard/readme" component={Readme}></Route>
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { history, location, storeWorkspace, hideMbar } = this.props;
        // 跳转
        if (location.pathname === '/dashboard') {
            history.push({ pathname: '/dashboard/workspace' });
        }
        // 给顶层 window 发送消息
        history.listen(route => {
            window.top.postMessage({ path: route.pathname }, '*');
            gtag('config', 'GA_TRACKING_ID', {'page_path': route.pathname});
        });
        window.top.postMessage({ path: window.location.pathname }, '*');
        gtag('config', 'GA_TRACKING_ID', {'page_path': window.location.pathname});
        // 获取工作空间
        api.getWorkspace().then(wsRes => {
            if (wsRes.code === 0) {
                // 获取创建工作空间数量限制
                api.getWorkspaceLimit().then(limitRes => {
                    if (limitRes.code === 0) {
                        const ws = wsRes.data.list;
                        const wsCount = ws.length;
                        const wsLimit = limitRes.data.workspace;
                        const canCreate = wsCount < wsLimit;
                        storeWorkspace({ ws, wsCount, wsLimit, canCreate });
                    }
                });
            }
        });
        // 缩放页面时，关闭 mbar
        window.addEventListener('resize', () => {
            const { isMbarOn } = this.props;
            if (isMbarOn) {
                hideMbar();
            }
        });
    }
}

const mapState = (state) => {
    return {
        wsCount: state.wsState.wsCount,
        isMbarOn: state.isMbarOn,
    }
}

const mapDispatch = (dispatch) => {
    return {
        storeWorkspace: (payload) => {
            dispatch({ type: 'STORE_WORKSPACE', payload })
        },
        hideMbar: () => dispatch({ type: 'SWITCH_MBAR_TO_OFF' }),
    }
}

export default connect(mapState, mapDispatch)(Home);
