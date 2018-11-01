import React from 'react';

import './history.css';

import i18n from '../../../utils/i18n';
import { getFormatTime } from '../../../utils/date';
import getStatus from './status';

const Row = ({ buildVersion, description, auditStatus, buildStatus, createdDate }) => {
    return (
        <tr>
            <td>{buildVersion}</td>
            <td>{description}</td>
            <td>{i18n(getStatus(auditStatus, buildStatus))}</td>
            <td>{getFormatTime(createdDate)}</td>
        </tr>
    );
}

const History = ({ historyVersions }) => {
    if (historyVersions.length === 0) {
        return <div className="no-version-history">{i18n('plugin.noVersionHistory')}</div>;
    }
    return (
        <table className="versions-table">
            <thead>
                <tr>
                    <th>{i18n('global.release')}</th>
                    <th>{i18n('plugin.releaseNote')}</th>
                    <th>{i18n('global.status')}</th>
                    <th>{i18n('plugin.publishTime')}</th>
                </tr>
            </thead>
            <tbody>
                {historyVersions.map(v => <Row key={v.id} {...v} />)}
            </tbody>
        </table>
    );
}

export default History;
