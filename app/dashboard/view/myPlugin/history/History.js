import React from 'react';

import './history.css';

import i18n from '../../../utils/i18n';
import { getFormatTime } from '../../../utils/date';

const Row = ({ buildVersion, description, createdDate }) => {
    return (
        <tr>
            <td>{buildVersion}</td>
            <td>{description}</td>
            <td>{getFormatTime(createdDate)}</td>
        </tr>
    );
}

const History = ({ historyVersions }) => {
    return (
        <table className="versions-table">
            <thead>
                <tr>
                    <th>{i18n('global.release')}</th>
                    <th>{i18n('plugin.releaseNote')}</th>
                    <th>{i18n('global.createdTime')}</th>
                </tr>
            </thead>
            <tbody>
                {historyVersions.map(v => <Row key={v.id} {...v} />)}
            </tbody>
        </table>
    );
}

export default History;
