import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';

import './plugin.css';

import Create from './create';
import ThirdParty from './thirdParty';
import Builtin from './builtin';
import DevelopedByMe from './developedByMe';
import Config from './config';
import i18n from '../../utils/i18n';

const routes = ['thirdparty', 'builtin', 'developedbyme'];

class Plugin extends Component {
    render() {
        const path = this.props.location.pathname;
        return (
            <div className="dash-plugin">
                {
                    routes.includes(path.split('/').pop()) && (
                        <div className="topbar">
                            <div className="nav">
                                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/thirdparty">{i18n('global.thirdparty')}</NavLink>
                                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/builtin">{i18n('global.builtin')}</NavLink>
                                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/developedbyme">{i18n('global.developedbyme')}</NavLink>
                            </div>
                            <a className="market" href="https://dev.tencent.com/" target="_blank" rel="noopener noreferrer">
                                <i className="fa fa-external-link"></i>
                                {i18n('plugin.viewPluginMarket')}
                            </a>
                        </div>
                    )
                }
                <Switch>
                    <Route exact path="/dashboard/plugin/create" component={Create} />
                    <Route exact path="/dashboard/plugin/thirdparty" component={ThirdParty} />
                    <Route exact path="/dashboard/plugin/builtin" component={Builtin} />
                    <Route exact path="/dashboard/plugin/developedbyme" component={DevelopedByMe} />
                    <Route exact path="/dashboard/plugin/developedbyme/config" component={Config} />
                </Switch>
            </div>
        );
    }

    componentDidMount() {
        this.handleRoute();
    }

    componentDidUpdate() {
        this.handleRoute();
    }

    handleRoute() {
        const { history, location } = this.props;
        // 跳转
        if (location.pathname === '/dashboard/plugin') {
            history.push({ pathname: '/dashboard/plugin/thirdparty' });
        }
    }
}

export default Plugin;
