import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import i18n from '../../../utils/i18n';

class NewPlugin extends Component {
    render() {
        return (
            <Link className="ws-card new" to="/dashboard/plugin/create">
                <div className="avatar"></div>
                <div className="content">
                    <div className="title">{i18n('plugin.createCSPlugin')}</div>
                </div>
            </Link>
        );
    }
}

export default NewPlugin;
