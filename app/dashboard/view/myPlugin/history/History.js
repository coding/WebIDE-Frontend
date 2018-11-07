import React, { Component } from 'react';

import './history.css';

import i18n from '../../../utils/i18n';
import { getFormatTime } from '../../../utils/date';
import getStatus from './status';

const Row = ({ buildVersion, description, auditStatus, buildStatus, auditRemark, createdDate }) => {
    return (
        <tr>
            <td>{buildVersion}</td>
            <td>{description}</td>
            <td>{i18n(getStatus(auditStatus, buildStatus))}</td>
            <td>{auditRemark}</td>
            <td>{getFormatTime(createdDate)}</td>
        </tr>
    );
}

class History extends Component {
    render() {
        const { historyVersions } = this.props;
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
                        <th>{i18n('plugin.auditOpinion')}</th>
                        <th>{i18n('plugin.publishTime')}</th>
                    </tr>
                </thead>
                <tbody>
                    {historyVersions.map(v => <Row key={v.id} {...v} />)}
                </tbody>
            </table>
        );
    }
}

export default History;
