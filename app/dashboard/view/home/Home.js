import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Link, Switch, Route, Redirect } from 'react-router-dom';

import './home.css';
import cloudstudio from '../../static/cloudstudio.svg';

import api from '../../api';
import i18n from '../../utils/i18n';
import Stripe from '../../share/stripe';
import Bell from '../bell';
import Profile from './profile';
import Banner from '../banner';
import Workspace from '../workspace';
import Create from '../create';
import Plugin from '../plugin';
import Setting from '../setting';
import About from '../about';

class Home extends Component {
    state = {
        isBellOn: false,
    }

    render() {
        const { isBellOn } = this.state;
        const { isMbarOn, wsCount, hideMbar } = this.props;
        return (
            <div id="dash-container" onClick={this.turnOffBellPanel}>
                <div className="dash-mbar">
                    <div className="logo">
                        <Link to="/dashboard/workspace" onClick={hideMbar}><img src={cloudstudio} alt="logo" /></Link>
                        <span className="beta">beta</span>
                    </div>
                    <Stripe />
                </div>
                <div className={`dash-mnav${isMbarOn ? ' on' : ''}`}>
                    <Link className="nav-item" to="/dashboard/workspace" onClick={hideMbar}>{i18n('global.workspace')} ({wsCount})</Link>
                    <Link className="nav-item" to="/dashboard/plugin" onClick={hideMbar}>{i18n('global.plugin')}</Link>
                    <Link className="nav-item" to="/dashboard/setting" onClick={hideMbar}>{i18n('global.setting')}</Link>
                    <Link className="nav-item" to="/dashboard/about" onClick={hideMbar}>{i18n('global.about')}</Link>
                    <a className="nav-item" href="https://dev.tencent.com/" target="_blank" rel="noopener noreferrer" onClick={hideMbar}>{i18n('global.tencentCloudDevPlatform')}</a>
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
                        <NavLink className="nav-item" activeClassName="active" to="/dashboard/plugin">{i18n('global.plugin')}</NavLink>
                        <NavLink className="nav-item" activeClassName="active" to="/dashboard/setting">{i18n('global.setting')}</NavLink>
                    </div>
                    <Bell on={isBellOn} togglePanel={this.toggleBellPanel} />
                    <Profile />
                </div>
                <div className="dash-main">
                    <Banner />
                    <div className="dash-view">
                        <Switch>
                            <Route exact path="/dashboard/workspace" component={Workspace}></Route>
                            <Route exact path="/dashboard/workspace/create" component={Create}></Route>
                            <Route path="/dashboard/plugin" component={Plugin}></Route>
                            <Route exact path="/dashboard/setting" component={Setting}></Route>
                            <Route exact path="/dashboard/about" component={About}></Route>
                            <Redirect to="/dashboard/workspace" />
                        </Switch>
                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        const { history, location, hideMbar } = this.props;
        const pathname = location.pathname;
        // 跳转
        if (pathname === '/dashboard') {
            history.push({ pathname: '/dashboard/workspace' });
        }
        // 给顶层 window 发送消息
        history.listen(route => {
            window.top.postMessage({ path: route.pathname }, '*');
            gtag('config', 'UA-65952334-9', {'page_path': route.pathname});
        });
        window.top.postMessage({ path: window.location.pathname }, '*');
        gtag('config', 'UA-65952334-9', {'page_path': window.location.pathname});
        // 获取工作空间数量信息
        this.fetchWorkspaceCount();
        // 缩放页面时，关闭 mbar
        window.addEventListener('resize', () => {
            const { isMbarOn } = this.props;
            if (isMbarOn) {
                hideMbar();
            }
        });
    }

    fetchWorkspaceCount() {
        const { storeWorkspace } = this.props;
        // 获取工作空间
        // 获取创建工作空间数量限制
        Promise.all([api.getWorkspace(), api.getWorkspaceLimit()]).then(values => {
            let ws = [];
            let wsLimit = 5;
            if (values[0].code === 0) {
                ws = values[0].data.list;
            }
            if (values[1].code === 0) {
                wsLimit = values[1].data.workspace;
            }
            // 保存 workspace 数量
            const wsCount = ws.length;
            storeWorkspace({
                wsCount: wsCount,
                wsLimit,
                canCreate: wsCount < wsLimit,
            });
        });
    }

    toggleBellPanel = (event) => {
        event.stopPropagation();
        this.setState(prevState => ({ isBellOn: !prevState.isBellOn }));
    }

    turnOffBellPanel = () => {
        this.setState({ isBellOn: false });
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
