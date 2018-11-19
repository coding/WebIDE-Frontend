import React from 'react';
import { NavLink } from 'react-router-dom';

import './topbar.css';

import i18n from '../../../utils/i18n';
import config from '../../../utils/config';

const href = window === window.top ? `${window.location.origin}/plugins` : `${config.studioOrigin}/plugins`;

const Topbar = () => {
    return (
        <div className="topbar">
            <div className="nav">
                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/thirdparty">{i18n('global.thirdparty')}</NavLink>
                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/builtin">{i18n('global.builtin')}</NavLink>
                <NavLink className="nav-item" activeClassName="on" to="/dashboard/plugin/mine">{i18n('global.mine')}</NavLink>
            </div>
            <a className="view-market" href={href} target="_blank" rel="noopener noreferrer">
                <i className="fa fa-external-link"></i>
                {i18n('plugin.viewPluginMarket')}
            </a>
        </div>
    );
}

export default Topbar;
