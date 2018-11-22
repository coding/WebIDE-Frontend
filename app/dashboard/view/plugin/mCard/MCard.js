import React, { Component } from 'react';
import { Link } from 'react-router-dom';

import './card.css';

import i18n from '../../../utils/i18n';
import config from '../../../utils/config';
import parseStatus from '../../pluginSet/status';

class MCard extends Component {
    render() {
        const { id, pluginName, remark, createdBy, repoName, pluginVersions } = this.props;
        const { version, status, hasPrePublish, preStatus } = parseStatus(pluginVersions);
        const marketHref = window === window.top ? `${window.location.origin}/plugins/detail/${id}` : `${config.studioOrigin}/plugins/detail/${id}`;
        const wsHref = `${window === window.top ? window.location.origin : config.studioOrigin}/ws/?ownerName=${createdBy}&projectName=${repoName}`;
        return (
            <div className = "plugin-card">
                <div className="top">
                    {
                        status === 5 ? (
                            <a className="name" href={marketHref} target="_blank" rel="noopener noreferrer">{pluginName}</a>
                        ) : <span className="name">{pluginName}</span>
                    }
                    <div className="right">
                        {status === 5 && <div className="version">v{version}</div>}
                        {
                            (hasPrePublish && preStatus === 2) ? (
                                <div className="tag">{i18n('plugin.prePublish')}</div>
                            ) : (status === 5 && <div className="tag">{i18n('plugin.published')}</div>)
                        }
                    </div>
                </div>
                <div className="desc">
                    <span>{remark}</span>
                </div>
                <div className="control">
                    <Link className="button" to={`/dashboard/plugin/mine/${id}`}>{i18n('global.manage')}</Link>
                    <a className="button" href={wsHref} target="_blank" rel="noopener noreferrer">{i18n('global.workspace')}</a>
                </div>
            </div>
        );
    }
}

export default MCard;
