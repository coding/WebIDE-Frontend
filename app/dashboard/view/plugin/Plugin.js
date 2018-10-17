import React, { Component } from 'react';
import { NavLink, Route, Switch } from 'react-router-dom';

import './plugin.css';

import Inbox from '../../share/inbox';
import Installed from './installed';
import Builtin from './builtin';
import Developed from './developed';
import i18n from '../../utils/i18n';

class Plugin extends Component {
    state = {
        filter: '',
    }

    render() {
        const { filter } = this.state;
        return (
            <div className="dash-plugin">
                <div className="topbar">
                    <div className="nav">
                        <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/installed">{i18n('global.installed')}</NavLink>
                        <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/builtin">{i18n('global.builtin')}</NavLink>
                        <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/developed">{i18n('global.developed')}</NavLink>
                    </div>
                    <div className="filter">
                        <Inbox holder="global.filter" value={filter} onChange={this.handleFilter} />
                    </div>
                </div>
                <Switch>
                    <Route exact path="/dashboard/plugin/installed" render={(props) => <Installed {...props} filter={filter} />}></Route>
                    <Route exact path="/dashboard/plugin/builtin" render={(props) => <Builtin {...props} filter={filter} />}></Route>
                    <Route exact path="/dashboard/plugin/developed" render={(props) => <Developed {...props} filter={filter} />}></Route>
                </Switch>
            </div>
        );
    }

    componentDidMount() {
        const { history, location } = this.props;
        // 跳转
        if (location.pathname === '/dashboard/plugin') {
            history.push({ pathname: '/dashboard/plugin/installed' });
        }
    }

    handleFilter = (event) => {
        this.setState({ filter: event.target.value });
    }
}

export default Plugin;
