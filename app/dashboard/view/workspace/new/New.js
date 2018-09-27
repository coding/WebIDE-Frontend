import React from 'react';
import { Link } from 'react-router-dom';

import './new.css';

import i18n from '../../../utils/i18n';

const New = () => {
    return (
        <Link className="ws-card new" to="/dashboard/workspace/create">
            <div className="avatar">+</div>
            <div className="content">{i18n('global.createWorkspace')}</div>
        </Link>
    );
}

export default New;
