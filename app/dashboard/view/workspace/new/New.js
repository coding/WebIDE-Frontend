import React from 'react';
import { Link } from 'react-router-dom';

import './new.css';

import i18n from '../../../utils/i18n';

const New = ({ isLimited }) => {
    return (
        isLimited ? (
            <div className="ws-card new disabled">
                <div className="avatar">+</div>
                <div className="content">
                    <div className="title">{i18n('global.createWorkspace')}</div>
                    <div className="desc">{i18n('global.limitTip')}</div>
                </div>
            </div>
        ) : (
            <Link className="ws-card new" to="/dashboard/workspace/create">
                <div className="avatar">+</div>
                <div className="content">
                    <div className="title">{i18n('global.createWorkspace')}</div>
                </div>
            </Link>
        )
    );
}

export default New;
