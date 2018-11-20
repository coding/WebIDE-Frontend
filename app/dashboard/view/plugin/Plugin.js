import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import './plugin.css';

import Create from './create';
import ThirdParty from './thirdParty';
import Builtin from './builtin';
import Mine from './mine';
import PluginSet from '../pluginSet';

class Plugin extends Component {
    render() {
        return (
            <Switch>
                <Route exact path="/dashboard/plugin/create" component={Create} />
                <Route exact path="/dashboard/plugin/thirdparty" component={ThirdParty} />
                <Route exact path="/dashboard/plugin/builtin" component={Builtin} />
                <Route exact path="/dashboard/plugin/mine" component={Mine} />
                <Route exact path="/dashboard/plugin/mine/:id" component={PluginSet} />
            </Switch>
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
