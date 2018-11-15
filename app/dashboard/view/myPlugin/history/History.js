import React, { Component } from 'react';
import Ansi from 'ansi-to-react';

import './history.css';

import i18n from '../../../utils/i18n';
import { getFormatTime } from '../../../utils/date';
import getStatus from './status';

const Row = ({ buildVersion, description, auditStatus, buildStatus, auditRemark, createdDate }) => {
    return (
        <tr>
            <td>{buildVersion}</td>
            <td>{description}</td>
            <td>
                {i18n(getStatus(auditStatus, buildStatus))}
            </td>
            <td>{auditRemark}</td>
            <td>{getFormatTime(createdDate)}</td>
        </tr>
    );
}

class History extends Component {
    state = {
        isPopOn: false,
        log: '',
    }

    render() {
        const { isPopOn, log } = this.state;
        const { historyVersions } = this.props;
        if (historyVersions.length === 0) {
            return <div className="no-version-history">{i18n('plugin.noVersionHistory')}</div>;
        }
        return (
            <div className="panel history">
                <div className="table-wrap">
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
                            {historyVersions.map(v => <Row key={v.id} {...v} handlePop={this.handlePop} />)}
                        </tbody>
                    </table>
                </div>
                {isPopOn && (
                    <div className="pop">
                        <div className="terminal">
                            <div className="title">
                                <div className="dot red"></div>
                                <div className="dot orange"></div>
                                <div className="dot green"></div>
                            </div>
                            <div className="content">
                                <Ansi>{log}</Ansi>
                            </div>
                        </div>
                        <div className="dismiss" onClick={this.handlePop}>+</div>
                    </div>
                )}
            </div>
        );
    }

    handlePop = (log) => {
        this.setState(prevState => ({ isPopOn: !prevState.isPopOn, log }));
    }
}

export default History;
