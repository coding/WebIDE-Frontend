import React, { Component } from 'react';
import { connect } from 'react-redux';
import { NavLink, Switch, Route } from 'react-router-dom';

import './home.css';
import cloudstudio from '../../static/cloudstudio.svg';

import api from '../../api';
import i18n from '../../utils/i18n';
import Setting from './setting';
import Banner from '../banner';
import Workspace from '../workspace';
import Create from '../create';
import Config from '../config';
import About from '../about';

class Home extends Component {
    render() {
        const { workspaceCount } = this.props;
        return (
            <div id="dash-container">
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
        const { history, location, workspaceCount, storeWorkspaceCount } = this.props;
        history.listen(route => {
            window.top.postMessage({ path: route.pathname }, '*');
        });
        if (location.pathname === '/dashboard') {
            history.push({ pathname: '/dashboard/workspace' });
        }
        window.top.postMessage({ path: window.location.pathname }, '*');
        if (!workspaceCount) {
            api.getWorkspace().then(res => {
                if (res.code === 0) {
                    storeWorkspaceCount(res.data.list.length);
                }
            });
        }
    }
}

const mapState = (state) => {
    return {
        workspaceCount: state.workspaceCount,
    }
}

const mapDispatch = (dispatch) => {
    return {
        storeWorkspaceCount: (payload) => dispatch({ type: 'STORE_WORKSPACE_COUNT', payload }),
    }
}

export default connect(mapState, mapDispatch)(Home);
